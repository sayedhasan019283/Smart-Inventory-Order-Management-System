import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { RestockQueueController } from './restockQueue.controller';
import {
  manualRestockValidation,
  restockQueueQueryValidation,
} from './restockQueue.validation';

const router = Router();

router.get(
  '/',
  auth('admin', 'user'),
  validateRequest(restockQueueQueryValidation),
  RestockQueueController.getRestockQueue
);

router.get(
  '/:id',
  auth('admin', 'user'),
  RestockQueueController.getSingleQueueEntry
);

router.patch(
  '/:id/restock',
  auth('admin', 'user'),
  validateRequest(manualRestockValidation),
  RestockQueueController.manualRestock
);

router.delete(
  '/:id',
  auth('admin'),
  RestockQueueController.removeFromQueue
);

export const RestockQueueRoutes = router;