import { Document, Types } from 'mongoose';

export type TProductStatus = 'Active' | 'Out of Stock';

export interface IProduct {
  name: string;
  category: Types.ObjectId;
  price: number;
  stockQuantity: number;
  minStockThreshold: number;
  status: TProductStatus;
  description?: string;
  productImage: string;
  createdBy: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IProductDocument extends IProduct, Document {
  _id: Types.ObjectId;
}
