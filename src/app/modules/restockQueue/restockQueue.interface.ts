import { Document, Types } from 'mongoose';

export type TRestockPriority = 'High' | 'Medium' | 'Low';

export interface IRestockQueue {
  product: Types.ObjectId;
  currentStock: number;
  threshold: number;
  priority: TRestockPriority;
  isResolved: boolean;
  resolvedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IRestockQueueDocument extends IRestockQueue, Document {
  _id: Types.ObjectId;
}