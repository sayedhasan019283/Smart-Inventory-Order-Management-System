import { z } from 'zod';

export const createCategoryValidation = z.object({
  body: z.object({
    name: z
      .string({ required_error: 'Category name is required' })
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name cannot exceed 100 characters'),
  }),
});

export const updateCategoryValidation = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    isActive: z.boolean().optional(),
  }),
});

export type TCreateCategory = z.infer<typeof createCategoryValidation>['body'];
export type TUpdateCategory = z.infer<typeof updateCategoryValidation>['body'];
