import { z } from 'zod';

const orderItemValidation = z.object({
  product: z
    .string({ required_error: 'Product ID is required' })
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid product ID'),
  quantity: z
    .number({ required_error: 'Quantity is required' })
    .min(1, 'Quantity must be at least 1'),
});

export const createOrderValidation = z.object({
  body: z.object({
    customerName: z
      .string({ required_error: 'Customer name is required' })
      .min(2, 'Name must be at least 2 characters')
      .max(200),
    customerEmail: z.string().email('Invalid email').optional(),
    items: z
      .array(orderItemValidation)
      .min(1, 'Order must have at least one item')
      .refine(
        (items) => {
          const ids = items.map((i) => i.product);
          return new Set(ids).size === ids.length;
        },
        { message: 'This product is already added to the order.' }
      ),
    note: z.string().max(500).optional(),
  }),
});

export const updateOrderStatusValidation = z.object({
  body: z.object({
    status: z.enum(
      ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
      { required_error: 'Status is required' }
    ),
  }),
});

export const getOrdersQueryValidation = z.object({
  query: z.object({
    status: z
      .enum(['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'])
      .optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    page: z.string().optional(),
    limit: z.string().optional(),
    search: z.string().optional(),
  }),
});

export type TCreateOrder = z.infer<typeof createOrderValidation>['body'];
export type TUpdateOrderStatus = z.infer<typeof updateOrderStatusValidation>['body'];