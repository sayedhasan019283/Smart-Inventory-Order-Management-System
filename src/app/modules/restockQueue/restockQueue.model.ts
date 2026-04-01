import { Schema, model } from 'mongoose';
import { IRestockQueueDocument } from './restockQueue.interface';

const restockQueueSchema = new Schema<IRestockQueueDocument>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      unique: true, // একই product এর duplicate entry হবে না
    },
    currentStock: {
      type: Number,
      required: true,
      min: 0,
    },
    threshold: {
      type: Number,
      required: true,
    },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Low'],
      required: true,
    },
    isResolved: {
      type: Boolean,
      default: false,
    },
    resolvedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);


restockQueueSchema.index({ isResolved: 1, currentStock: 1 });

const RestockQueueModel = model<IRestockQueueDocument>(
  'RestockQueue',
  restockQueueSchema
);
export default RestockQueueModel;