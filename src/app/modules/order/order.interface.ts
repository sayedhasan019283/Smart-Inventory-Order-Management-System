import { Document, Types } from 'mongoose';

export type TOrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Shipped'
  | 'Delivered'
  | 'Cancelled';

export interface IOrderItem {
  product: Types.ObjectId;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface IOrder {
  orderNumber: string;
  customerName: string;
  customerEmail?: string;
  items: IOrderItem[];
  totalPrice: number;
  status: TOrderStatus;
  note?: string;
  createdBy: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IOrderDocument extends IOrder, Document {
  _id: Types.ObjectId;
}