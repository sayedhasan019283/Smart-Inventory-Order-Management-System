import { Document, Types } from 'mongoose';

export type TActionType =
  | 'ORDER_CREATED'
  | 'ORDER_STATUS_UPDATED'
  | 'ORDER_CANCELLED'
  | 'PRODUCT_ADDED'
  | 'PRODUCT_UPDATED'
  | 'PRODUCT_RESTOCKED'
  | 'PRODUCT_OUT_OF_STOCK'
  | 'RESTOCK_QUEUE_ADDED'
  | 'RESTOCK_QUEUE_RESOLVED'
  | 'CATEGORY_CREATED'
  | 'USER_SIGNUP'
  | 'USER_LOGIN';

export type TRefModel = 'Order' | 'Product' | 'Category' | 'User';

export interface IActivityLog {
  action: TActionType;
  description: string;
  performedBy?: Types.ObjectId;
  refModel?: TRefModel;
  refId?: Types.ObjectId;
  metadata?: Record<string, unknown>;
  createdAt?: Date;
}

export interface IActivityLogDocument extends IActivityLog, Document {
  _id: Types.ObjectId;
}