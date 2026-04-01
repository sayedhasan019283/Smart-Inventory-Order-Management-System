import { Types } from 'mongoose';
import { IProduct } from './product.interface';
import ProductModel from './product.model';
import RestockQueueModel from '../restockQueue/restockQueue.model';
import { createActivityLog } from '../activityLog/activityLog.service';

// ─── helper ───────────────────────────────────────────────

const derivePriority = (
  stock: number,
  threshold: number,
): 'High' | 'Medium' | 'Low' => {
  if (stock === 0) return 'High';
  if (stock < threshold / 2) return 'Medium';
  return 'Low';
};

const handleRestockQueue = async (
  productId: Types.ObjectId,
  productName: string,
  stock: number,
  threshold: number,
  userId: Types.ObjectId,
) => {
  if (stock < threshold) {
    await RestockQueueModel.findOneAndUpdate(
      { product: productId },
      {
        currentStock: stock,
        threshold,
        priority: derivePriority(stock, threshold),
        isResolved: false,
        resolvedAt: undefined,
      },
      { upsert: true, new: true },
    );

    await createActivityLog({
      action: 'RESTOCK_QUEUE_ADDED',
      description: `Product "${productName}" added to Restock Queue`,
      performedBy: userId,
      refModel: 'Product',
      refId: productId,
    });
  } else {
    // threshold এর উপরে গেলে resolve করো
    await RestockQueueModel.findOneAndUpdate(
      { product: productId, isResolved: false },
      { isResolved: true, resolvedAt: new Date(), currentStock: stock },
    );
  }
};

// ─── create ───────────────────────────────────────────────

const createProductIntoDB = async (
  payload: Partial<IProduct>,
  files: { productImage?: Express.Multer.File[] },
  userId: Types.ObjectId,
) => {
  if (files?.productImage?.[0]) {
    payload.productImage = `/uploads/users/${files.productImage[0].filename}`;
  }

  if (!payload.createdBy) {
    payload.createdBy = userId;
  }

  const newProduct = await ProductModel.create(payload);

  // create করার সময়ই threshold এর নিচে থাকলে queue তে add করো
  if (newProduct.stockQuantity < newProduct.minStockThreshold) {
    await handleRestockQueue(
      newProduct._id as Types.ObjectId,
      newProduct.name,
      newProduct.stockQuantity,
      newProduct.minStockThreshold,
      userId,
    );
  }

  await createActivityLog({
    action: 'PRODUCT_ADDED',
    description: `Product "${newProduct.name}" added to inventory`,
    performedBy: userId,
    refModel: 'Product',
    refId: newProduct._id as Types.ObjectId,
  });

  return newProduct;
};

// ─── read all ─────────────────────────────────────────────

const readAllProductsFromDB = async (query: {
  category?: string;
  status?: string;
  search?: string;
  page?: string;
  limit?: string;
  sortBy?: string;
}) => {
  const filter: Record<string, unknown> = {};

  if (query.category) filter.category = new Types.ObjectId(query.category);
  if (query.status) filter.status = query.status;

  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { description: { $regex: query.search, $options: 'i' } },
    ];
  }

  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    price: { price: 1 },
    stock: { stockQuantity: 1 },
    name: { name: 1 },
  };
  const sort = query.sortBy
    ? (sortMap[query.sortBy] ?? { createdAt: -1 })
    : { createdAt: -1 };

  const [products, total] = await Promise.all([
    ProductModel.find(filter)
      .populate('category', 'name')
      .populate('createdBy', 'name email')
      .sort(sort as Record<string, 1 | -1>)
      .skip(skip)
      .limit(limit)
      .lean(),
    ProductModel.countDocuments(filter),
  ]);

  return {
    products,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

// ─── read single ──────────────────────────────────────────

const readSingleProductFromDB = async (productId: string) => {
  const product = await ProductModel.findById(productId)
    .populate('category', 'name')
    .populate('createdBy', 'name email');
  return product;
};

// ─── update ───────────────────────────────────────────────

const updateProductIntoDB = async (
  productId: string,
  payload: Partial<IProduct>,
  files: { productImage?: Express.Multer.File[] },
  userId: Types.ObjectId,
) => {
  if (files?.productImage?.[0]) {
    payload.productImage = `/uploads/users/${files.productImage[0].filename}`;
  }

  const product = await ProductModel.findById(productId);
  if (!product) return null;

  // stockQuantity change হলে .save() use করো — pre-save hook fire করার জন্য
  if (payload.stockQuantity !== undefined) {
    Object.assign(product, payload);
    await product.save();

    await handleRestockQueue(
      product._id as Types.ObjectId,
      product.name,
      product.stockQuantity,
      product.minStockThreshold,
      userId,
    );

    await createActivityLog({
      action: 'PRODUCT_UPDATED',
      description: `Product "${product.name}" updated`,
      performedBy: userId,
      refModel: 'Product',
      refId: product._id as Types.ObjectId,
      metadata: { updatedFields: Object.keys(payload) },
    });

    return product;
  }

  // stock change নেই — findByIdAndUpdate safe
  const updatedProduct = await ProductModel.findByIdAndUpdate(
    productId,
    payload,
    { new: true },
  ).populate('category', 'name');

  await createActivityLog({
    action: 'PRODUCT_UPDATED',
    description: `Product "${product.name}" updated`,
    performedBy: userId,
    refModel: 'Product',
    refId: product._id as Types.ObjectId,
    metadata: { updatedFields: Object.keys(payload) },
  });

  return updatedProduct;
};

// ─── restock ──────────────────────────────────────────────

const restockProductIntoDB = async (
  productId: string,
  quantity: number,
  userId: Types.ObjectId,
) => {
  const product = await ProductModel.findById(productId);
  if (!product) return null;

  product.stockQuantity += quantity;
  await product.save(); // pre-save hook — status auto update

  await handleRestockQueue(
    product._id as Types.ObjectId,
    product.name,
    product.stockQuantity,
    product.minStockThreshold,
    userId,
  );

  await createActivityLog({
    action: 'PRODUCT_RESTOCKED',
    description: `Stock updated for "${product.name}" (+${quantity} units)`,
    performedBy: userId,
    refModel: 'Product',
    refId: product._id as Types.ObjectId,
    metadata: { addedQuantity: quantity, newStock: product.stockQuantity },
  });

  return product;
};

// ─── delete ───────────────────────────────────────────────

const deleteProductFromDB = async (
  productId: string,
  userId: Types.ObjectId,
) => {
  const product = await ProductModel.findById(productId);
  if (!product) return null;

  await ProductModel.findByIdAndDelete(productId);

  // restock queue থেকেও remove
  await RestockQueueModel.findOneAndDelete({ product: product._id });

  await createActivityLog({
    action: 'PRODUCT_UPDATED',
    description: `Product "${product.name}" deleted from inventory`,
    performedBy: userId,
    refModel: 'Product',
    refId: product._id as Types.ObjectId,
  });

  return product;
};

export const ProductService = {
  createProductIntoDB,
  readAllProductsFromDB,
  readSingleProductFromDB,
  updateProductIntoDB,
  restockProductIntoDB,
  deleteProductFromDB,
};
