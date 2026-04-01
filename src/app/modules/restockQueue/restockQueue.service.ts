import { Types } from 'mongoose';
import ProductModel from '../product/product.model';
import RestockQueueModel from './restockQueue.model';
import { TManualRestock } from './restockQueue.validation';
import AppError from '../../../errors/AppError';
import { createActivityLog } from '../activityLog/activityLog.service';

// ─── helper ───────────────────────────────────────────────

export const derivePriority = (
  stock: number,
  threshold: number
): 'High' | 'Medium' | 'Low' => {
  if (stock === 0) return 'High';
  if (stock < threshold / 2) return 'Medium';
  return 'Low';
};

// ─── get all queue entries ────────────────────────────────

const getRestockQueueFromDB = async (query: {
  priority?: string;
  isResolved?: string;
  page?: string;
  limit?: string;
}) => {
  const filter: Record<string, unknown> = {};

  if (query.priority) filter.priority = query.priority;

  // default: unresolved items দেখাবে
  filter.isResolved = query.isResolved === 'true' ? true : false;

  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    RestockQueueModel.find(filter)
      .populate('product', 'name price status stockQuantity')
      .sort({ currentStock: 1 }) // lowest stock first
      .skip(skip)
      .limit(limit),
    RestockQueueModel.countDocuments(filter),
  ]);

  return {
    items,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

// ─── get single queue entry ───────────────────────────────

const getSingleQueueEntryFromDB = async (id: string) => {
  const entry = await RestockQueueModel.findById(id).populate(
    'product',
    'name price status stockQuantity minStockThreshold'
  );
  if (!entry) throw new AppError(404, 'Restock queue entry not found');
  return entry;
};

// ─── manual restock ───────────────────────────────────────

const manualRestockIntoDB = async (
  queueId: string,
  payload: TManualRestock,
  userId: Types.ObjectId
) => {
  const entry = await RestockQueueModel.findById(queueId);
  if (!entry) throw new AppError(404, 'Restock queue entry not found');

  const product = await ProductModel.findById(entry.product);
  if (!product) throw new AppError(404, 'Product not found');

  // stock update — save() use করছি যেন pre-save hook fire হয়
  product.stockQuantity += payload.quantity;
  await product.save();

  // threshold cross হয়ে গেলে resolve করো
  if (product.stockQuantity >= product.minStockThreshold) {
    entry.isResolved = true;
    entry.resolvedAt = new Date();
    entry.currentStock = product.stockQuantity;
    entry.priority = derivePriority(
      product.stockQuantity,
      product.minStockThreshold
    );
    await entry.save();

    await createActivityLog({
      action: 'RESTOCK_QUEUE_RESOLVED',
      description: `Restock queue resolved for "${product.name}"`,
      performedBy: userId,
      refModel: 'Product',
      refId: product._id as Types.ObjectId,
      metadata: { addedQuantity: payload.quantity, newStock: product.stockQuantity },
    });
  } else {
    // এখনো threshold এর নিচে — priority update করো
    entry.currentStock = product.stockQuantity;
    entry.priority = derivePriority(
      product.stockQuantity,
      product.minStockThreshold
    );
    await entry.save();
  }

  await createActivityLog({
    action: 'PRODUCT_RESTOCKED',
    description: `Stock updated for "${product.name}" (+${payload.quantity} units)`,
    performedBy: userId,
    refModel: 'Product',
    refId: product._id as Types.ObjectId,
    metadata: { addedQuantity: payload.quantity, newStock: product.stockQuantity },
  });

  return entry;
};

// ─── remove from queue ────────────────────────────────────

const removeFromQueueDB = async (
  queueId: string,
  userId: Types.ObjectId
) => {
  const entry = await RestockQueueModel.findById(queueId).populate(
    'product',
    'name'
  );
  if (!entry) throw new AppError(404, 'Restock queue entry not found');

  await RestockQueueModel.findByIdAndDelete(queueId);

  const productName =
    (entry.product as { name?: string })?.name ?? 'Unknown product';

  await createActivityLog({
    action: 'RESTOCK_QUEUE_RESOLVED',
    description: `"${productName}" manually removed from restock queue`,
    performedBy: userId,
    refModel: 'Product',
    refId: entry.product as Types.ObjectId,
  });

  return { message: 'Removed from restock queue' };
};

export const RestockQueueService = {
  getRestockQueueFromDB,
  getSingleQueueEntryFromDB,
  manualRestockIntoDB,
  removeFromQueueDB,
};