import { Router } from 'express';
import auth from '../../middlewares/auth';
import { ActivityLogController } from './activityLog.controller';

const router = Router();

router.get(
  '/',
  auth('admin', 'user'),
  ActivityLogController.getActivityLogs
);

export const ActivityLogRoutes = router;