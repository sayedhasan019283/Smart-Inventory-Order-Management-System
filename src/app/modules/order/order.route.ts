import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { OrderController } from './order.controller';
import {
  createOrderValidation,
  getOrdersQueryValidation,
  updateOrderStatusValidation,
} from './order.validation';

const router = Router();

router.post(
  '/',
  auth('admin', 'user'),
  validateRequest(createOrderValidation),
  OrderController.createOrder
);

router.get(
  '/',
  auth('admin', 'user'),
  validateRequest(getOrdersQueryValidation),
  OrderController.getAllOrders
);

router.get(
  '/:id',
  auth('admin', 'user'),
  OrderController.getSingleOrder
);

router.patch(
  '/:id/status',
  auth('admin', 'user'),
  validateRequest(updateOrderStatusValidation),
  OrderController.updateOrderStatus
);

router.delete(
  '/:id',
  auth('admin'),
  OrderController.deleteOrder
);

export const OrderRoutes = router;