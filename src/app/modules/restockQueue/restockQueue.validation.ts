import { z } from 'zod';

export const manualRestockValidation = z.object({
  body: z.object({
    quantity: z
      .number({ required_error: 'Quantity is required' })
      .min(1, 'Quantity must be at least 1'),
  }),
});

export const restockQueueQueryValidation = z.object({
  query: z.object({
    priority: z.enum(['High', 'Medium', 'Low']).optional(),
    isResolved: z
      .string()
      .transform((v) => v === 'true')
      .optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

export type TManualRestock = z.infer<typeof manualRestockValidation>['body'];