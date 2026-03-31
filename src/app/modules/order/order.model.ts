import { Schema, model } from 'mongoose';
import { IOrderDocument } from './order.interface';

const orderItemSchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
    },
    unitPrice: {
      type: Number,
      required: true,
      min: [0, 'Unit price cannot be negative'],
    },
    subtotal: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrderDocument>(
  {
    orderNumber: {
      type: String,
      unique: true,
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      maxlength: [200, 'Customer name cannot exceed 200 characters'],
    },
    customerEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items: unknown[]) => items.length > 0,
        message: 'Order must have at least one item',
      },
    },
    totalPrice: {
      type: Number,
      required: true,
      min: [0, 'Total price cannot be negative'],
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    note: {
      type: String,
      maxlength: [500, 'Note cannot exceed 500 characters'],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const count = await model('Order').countDocuments();
    this.orderNumber = `ORD-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ createdBy: 1 });
orderSchema.index({ orderNumber: 1 });

const OrderModel = model<IOrderDocument>('Order', orderSchema);
export default OrderModel;