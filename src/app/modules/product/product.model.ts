import { Schema, model } from 'mongoose';
import { IProductDocument } from './product.interface';

const productSchema = new Schema<IProductDocument>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
    },
    productImage: {
      type: String,
      default : '',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    stockQuantity: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock quantity cannot be negative'],
      default: 0,
    },
    minStockThreshold: {
      type: Number,
      required: [true, 'Minimum stock threshold is required'],
      min: [0, 'Threshold cannot be negative'],
      default: 5,
    },
    status: {
      type: String,
      enum: ['Active', 'Out of Stock'],
      default: 'Active',
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Auto-update status when stockQuantity changes
productSchema.pre('save', function (next) {
  if (this.isModified('stockQuantity')) {
    this.status = this.stockQuantity === 0 ? 'Out of Stock' : 'Active';
  }
  next();
});

// Index for search and filter performance
productSchema.index({ name: 'text' });
productSchema.index({ category: 1, status: 1 });
productSchema.index({ stockQuantity: 1 });

const ProductModel = model<IProductDocument>('Product', productSchema);
export default ProductModel;
