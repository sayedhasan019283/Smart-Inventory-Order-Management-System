import { Schema, model } from 'mongoose';
import { IActivityLogDocument } from './activityLog.interface';

const activityLogSchema = new Schema<IActivityLogDocument>(
  {
    action: {
      type: String,
      enum: [
        'ORDER_CREATED',
        'ORDER_STATUS_UPDATED',
        'ORDER_CANCELLED',
        'PRODUCT_ADDED',
        'PRODUCT_UPDATED',
        'PRODUCT_RESTOCKED',
        'PRODUCT_OUT_OF_STOCK',
        'RESTOCK_QUEUE_ADDED',
        'RESTOCK_QUEUE_RESOLVED',
        'CATEGORY_CREATED',
        'USER_SIGNUP',
        'USER_LOGIN',
      ],
      required: true,
    },
    description: {
      type: String,
      required: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    refModel: {
      type: String,
      enum: ['Order', 'Product', 'Category', 'User'],
    },
    refId: {
      type: Schema.Types.ObjectId,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);


activityLogSchema.index({ createdAt: -1 });

activityLogSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 30 }
);

const ActivityLogModel = model<IActivityLogDocument>(
  'ActivityLog',
  activityLogSchema
);
export default ActivityLogModel;