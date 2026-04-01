import { Types } from 'mongoose';
import ProductModel from '../product/product.model';
import OrderModel from './order.model';
import ActivityLogModel from '../activityLog/activityLog.model';
import { TCreateOrder, TUpdateOrderStatus } from './order.validation';
import AppError from '../../../errors/AppError';
import RestockQueueModel from '../restockQueue/restockQueue.model';

// ─── helpers ──────────────────────────────────────────────

const derivePriority = (stock: number, threshold: number) => {
  if (stock === 0) return 'High';
  if (stock < threshold / 2) return 'Medium';
  return 'Low';
};

const logActivity = async (
  action: string,
  description: string,
  performedBy: Types.ObjectId,
  refId?: Types.ObjectId
) => {
  await ActivityLogModel.create({
    action,
    description,
    performedBy,
    refModel: 'Order',
    refId,
  });
};

// ─── create order ─────────────────────────────────────────

const createOrderIntoDB = async (
  payload: TCreateOrder,
  userId: Types.ObjectId
) => {
  const orderItems = [];
  let totalPrice = 0;

  for (const item of payload.items) {
    const product = await ProductModel.findById(item.product);

    // conflict: product not found
    if (!product) {
      throw new AppError(404, `Product not found: ${item.product}`);
    }

    // conflict: inactive product
    if (product.status === 'Out of Stock') {
      throw new AppError(
        400,
        `This product is currently unavailable: ${product.name}`
      );
    }

    // conflict: insufficient stock
    if (item.quantity > product.stockQuantity) {
      throw new AppError(
        400,
        `Only ${product.stockQuantity} items available in stock for "${product.name}"`
      );
    }

    const subtotal = product.price * item.quantity;
    totalPrice += subtotal;

    orderItems.push({
      product: product._id,
      productName: product.name,
      quantity: item.quantity,
      unitPrice: product.price,
      subtotal,
    });

    // deduct stock — use save() so pre-save hook fires (auto status update)
    product.stockQuantity -= item.quantity;
    await product.save();

    // restock queue logic
    if (product.stockQuantity < product.minStockThreshold) {
      const priority = derivePriority(
        product.stockQuantity,
        product.minStockThreshold
      );

      await RestockQueueModel.findOneAndUpdate(
        { product: product._id },
        {
          currentStock: product.stockQuantity,
          threshold: product.minStockThreshold,
          priority,
          isResolved: false,
          resolvedAt: undefined,
        },
        { upsert: true, new: true }
      );

      await logActivity(
        'RESTOCK_QUEUE_ADDED',
        `Product "${product.name}" added to Restock Queue`,
        userId,
      );
    }
  }

  const order = await OrderModel.create({
    customerName: payload.customerName,
    customerEmail: payload.customerEmail,
    items: orderItems,
    totalPrice,
    note: payload.note,
    createdBy: userId,
  });

  await logActivity(
    'ORDER_CREATED',
    `Order ${order.orderNumber} created by user`,
    userId,
    order._id
  );

  return order;
};

// ─── get all orders ───────────────────────────────────────

const getAllOrdersFromDB = async (query: {
  status?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: string;
  limit?: string;
}) => {
  const filter: Record<string, unknown> = {};

  if (query.status) filter.status = query.status;

  if (query.startDate || query.endDate) {
    filter.createdAt = {};
    if (query.startDate)
      (filter.createdAt as Record<string, unknown>).$gte = new Date(query.startDate);
    if (query.endDate)
      (filter.createdAt as Record<string, unknown>).$lte = new Date(query.endDate);
  }

  if (query.search) {
    filter.$or = [
      { customerName: { $regex: query.search, $options: 'i' } },
      { orderNumber: { $regex: query.search, $options: 'i' } },
    ];
  }

  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    OrderModel.find(filter)
      .populate('createdBy', 'name email')
      .populate('items.product', 'name price')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    OrderModel.countDocuments(filter),
  ]);

  return {
    orders,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

// ─── get single order ─────────────────────────────────────

const getSingleOrderFromDB = async (orderId: string) => {
  const order = await OrderModel.findById(orderId)
    .populate('createdBy', 'name email')
    .populate('items.product', 'name price status');

  if (!order) throw new AppError(404, 'Order not found');
  return order;
};

// ─── update order status ──────────────────────────────────

const updateOrderStatusIntoDB = async (
  orderId: string,
  payload: TUpdateOrderStatus,
  userId: Types.ObjectId
) => {
  const order = await OrderModel.findById(orderId);
  if (!order) throw new AppError(404, 'Order not found');

  // prevent updating already cancelled/delivered orders
  if (order.status === 'Cancelled') {
    throw new AppError(400, 'Cannot update a cancelled order');
  }
  if (order.status === 'Delivered') {
    throw new AppError(400, 'Cannot update a delivered order');
  }

  const previousStatus = order.status;

  // if cancelling — restore stock
  if (payload.status === 'Cancelled') {
    for (const item of order.items) {
      const product = await ProductModel.findById(item.product);
      if (product) {
        product.stockQuantity += item.quantity;
        await product.save();

        // remove from restock queue if now above threshold
        if (product.stockQuantity >= product.minStockThreshold) {
          await RestockQueueModel.findOneAndUpdate(
            { product: product._id },
            { isResolved: true, resolvedAt: new Date() }
          );
        }
      }
    }
  }

  order.status = payload.status;
  await order.save();

  await logActivity(
    'ORDER_STATUS_UPDATED',
    `Order ${order.orderNumber} status changed from ${previousStatus} to ${payload.status}`,
    userId,
    order._id
  );

  return order;
};

// ─── cancel & delete order ────────────────────────────────

const deleteOrderFromDB = async (
  orderId: string,
  userId: Types.ObjectId
) => {
  const order = await OrderModel.findById(orderId);
  if (!order) throw new AppError(404, 'Order not found');

  // restore stock before deleting
  if (order.status !== 'Cancelled') {
    for (const item of order.items) {
      const product = await ProductModel.findById(item.product);
      if (product) {
        product.stockQuantity += item.quantity;
        await product.save();

        if (product.stockQuantity >= product.minStockThreshold) {
          await RestockQueueModel.findOneAndUpdate(
            { product: product._id },
            { isResolved: true, resolvedAt: new Date() }
          );
        }
      }
    }
  }

  await OrderModel.findByIdAndDelete(orderId);

  await logActivity(
    'ORDER_CANCELLED',
    `Order ${order.orderNumber} was deleted`,
    userId,
    order._id
  );

  return { message: 'Order deleted successfully' };
};

export const OrderService = {
  createOrderIntoDB,
  getAllOrdersFromDB,
  getSingleOrderFromDB,
  updateOrderStatusIntoDB,
  deleteOrderFromDB,
};