import { z } from 'zod';

// ─── reusable helpers ──────────────────────────────────────
const numericString = (schema: z.ZodNumber) =>
  z.preprocess((val) => {
    if (typeof val === 'string' && val.trim() !== '') return Number(val);
    return val;
  }, schema);

const objectIdString = (required = true) => {
  const base = z
    .string({ required_error: required ? 'Category is required' : undefined })
    .trim()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid category ID');
  return required ? base : base.optional();
};

// ─── create ───────────────────────────────────────────────
export const createProductValidation = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Product name is required' })
      .min(2, 'Name must be at least 2 characters')
      .max(200, 'Name cannot exceed 200 characters'),

    category: objectIdString(true),

    price: numericString(
      z
        .number({ required_error: 'Price is required' })
        .min(0, 'Price cannot be negative'),
    ),

    stockQuantity: numericString(
      z
        .number({ required_error: 'Stock quantity is required' })
        .min(0, 'Stock quantity cannot be negative'),
    ),

    minStockThreshold: numericString(
      z.number().min(0, 'Threshold cannot be negative'),
    ).default(5),

    description: z.string().max(1000).optional(),
  }),
});

// ─── update ───────────────────────────────────────────────
export const updateProductValidation = z.object({
  body: z.object({
    name: z.string().min(2).max(200).optional(),

    category: objectIdString(false),

    price: numericString(z.number().min(0)).optional(),
    stockQuantity: numericString(z.number().min(0)).optional(),
    minStockThreshold: numericString(z.number().min(0)).optional(),
    description: z.string().max(1000).optional(),
    status: z.enum(['Active', 'Out of Stock']).optional(),
  }),
});

// ─── restock ──────────────────────────────────────────────
export const restockProductValidation = z.object({
  body: z.object({
    quantity: numericString(
      z
        .number({ required_error: 'Quantity is required' })
        .min(1, 'Quantity must be at least 1'),
    ),
  }),
});

// ─── types ────────────────────────────────────────────────
export type TCreateProduct = z.infer<typeof createProductValidation>['body'];
export type TUpdateProduct = z.infer<typeof updateProductValidation>['body'];
export type TRestockProduct = z.infer<typeof restockProductValidation>['body'];