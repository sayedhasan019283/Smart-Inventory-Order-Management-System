import express from 'express';
import { AuthRoutes } from '../app/modules/Auth/auth.route';
import { UserRoutes } from '../app/modules/user/user.route';
import { paymentRoute } from '../app/modules/payment/payment.route';
import { CategoryRoute } from '../app/modules/category/category.route';
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
  }
];   

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;
