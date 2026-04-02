// product.validation.ts

import { z } from 'zod';

// ─── reusable helper ───────────────────────────────────────
const numericString = (schema: z.ZodNumber) =>
  z.preprocess((val) => {
    if (typeof val === 'string' && val.trim() !== '') return Number(val);
    return val;
  }, schema);

export const createProductValidation = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Product name is required' })
      .min(2, 'Name must be at least 2 characters')
      .max(200, 'Name cannot exceed 200 characters'),

    category: z
      .string({ required_error: 'Category is required' })
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID'),

    price: numericString(
      z.number({ required_error: 'Price is required' }).min(0, 'Price cannot be negative')
    ),

    stockQuantity: numericString(
      z.number({ required_error: 'Stock quantity is required' }).min(0, 'Stock quantity cannot be negative')
    ),

    minStockThreshold: numericString(
      z.number().min(0, 'Threshold cannot be negative')
    ).default(5),

    description: z.string().max(1000).optional(),
  }),
});

export const updateProductValidation = z.object({
  body: z.object({
    name: z.string().min(2).max(200).optional(),
    category: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID')
      .optional(),
    price: numericString(z.number().min(0)).optional(),
    stockQuantity: numericString(z.number().min(0)).optional(),
    minStockThreshold: numericString(z.number().min(0)).optional(),
    description: z.string().max(1000).optional(),
    status: z.enum(['Active', 'Out of Stock']).optional(),
  }),
});

export const restockProductValidation = z.object({
  body: z.object({
    quantity: numericString(
      z.number({ required_error: 'Quantity is required' }).min(1, 'Quantity must be at least 1')
    ),
  }),
});