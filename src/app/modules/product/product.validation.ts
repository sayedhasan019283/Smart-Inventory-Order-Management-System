import { z } from 'zod';

export const createProductValidation = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Product name is required' })
      .min(2, 'Name must be at least 2 characters')
      .max(200, 'Name cannot exceed 200 characters'),
    category: z
      .string({ required_error: 'Category is required' })
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID'),
    price: z
      .number({ required_error: 'Price is required' })
      .min(0, 'Price cannot be negative'),
    stockQuantity: z
      .number({ required_error: 'Stock quantity is required' })
      .min(0, 'Stock quantity cannot be negative'),
    minStockThreshold: z
      .number()
      .min(0, 'Threshold cannot be negative')
      .default(5),
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
    price: z.number().min(0).optional(),
    stockQuantity: z.number().min(0).optional(),
    minStockThreshold: z.number().min(0).optional(),
    description: z.string().max(1000).optional(),
    status: z.enum(['Active', 'Out of Stock']).optional(),
  }),
});

export const restockProductValidation = z.object({
  body: z.object({
    quantity: z
      .number({ required_error: 'Quantity is required' })
      .min(1, 'Quantity must be at least 1'),
  }),
});

export type TCreateProduct = z.infer<typeof createProductValidation>['body'];
export type TUpdateProduct = z.infer<typeof updateProductValidation>['body'];
export type TRestockProduct = z.infer<typeof restockProductValidation>['body'];
