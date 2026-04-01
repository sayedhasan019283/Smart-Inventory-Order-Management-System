import { Router } from 'express';
import auth from '../../middlewares/auth';
import { DashboardController } from './dashboard.controller';

const router = Router();

router.get(
  '/stats',
  auth('admin', 'user'),
  DashboardController.getDashboardStats
);

router.get(
  '/analytics',
  auth('admin', 'user'),
  DashboardController.getDashboardAnalytics
);

export const DashboardRoutes = router;