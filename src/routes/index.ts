import express from 'express';
import { AuthRoutes } from '../app/modules/Auth/auth.route';
import { UserRoutes } from '../app/modules/user/user.route';
import { paymentRoute } from '../app/modules/payment/payment.route';
import { CategoryRoute } from '../app/modules/category/category.route';
import { ProductRoute } from '../app/modules/product/product.route';
import { OrderRoutes } from '../app/modules/order/order.route';
import { RestockQueueRoutes } from '../app/modules/restockQueue/restockQueue.route';
import { ActivityLogRoutes } from '../app/modules/activityLog/activityLog.route';
import { DashboardRoutes } from '../app/modules/dashboard/dashboard.route';

const router = express.Router();

const apiRoutes = [
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/user',
    route: UserRoutes,
  },
  {
    path: '/payment',
    route: paymentRoute,
  },
  {
    path: '/category',
    route: CategoryRoute,
  },
  {
    path: '/product',
    route: ProductRoute,
  },
  {
    path: '/order',
    route: OrderRoutes,
  },
  {
    path: '/restock-queue',
    route: RestockQueueRoutes,
  },
  {
    path: '/activity-log',
    route: ActivityLogRoutes,
  },
  {
    path: '/dashboard',
    route: DashboardRoutes,
  },
];

apiRoutes.forEach((route) => router.use(route.path, route.route));

export default router;