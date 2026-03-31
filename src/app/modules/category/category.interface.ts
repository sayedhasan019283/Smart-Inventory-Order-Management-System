import { Document, Types } from 'mongoose';

export type TCategory = {
  name: string;
  createdBy: Types.ObjectId;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICategoryDocument extends TCategory, Document {
  _id: Types.ObjectId;
}
