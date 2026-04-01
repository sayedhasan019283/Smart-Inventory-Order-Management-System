import ActivityLogModel from '../activityLog/activityLog.model';
import OrderModel from '../order/order.model';
import ProductModel from '../product/product.model';
import RestockQueueModel from '../restockQueue/restockQueue.model';

const getDashboardStatsFromDB = async () => {
  // আজকের শুরু এবং শেষ time
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  // সব query parallel এ চালাও — performance এর জন্য
  const [
    totalOrdersToday,
    pendingOrders,
    completedOrders,
    revenueToday,
    lowStockCount,
    productSummary,
    recentActivity,
  ] = await Promise.all([

    // আজকের মোট orders
    OrderModel.countDocuments({
      createdAt: { $gte: todayStart, $lte: todayEnd },
    }),

    // pending orders count
    OrderModel.countDocuments({ status: 'Pending' }),

    // completed (Delivered) orders count
    OrderModel.countDocuments({ status: 'Delivered' }),

    // আজকের revenue — aggregate
    OrderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: todayStart, $lte: todayEnd },
          status: { $ne: 'Cancelled' },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$totalPrice' },
        },
      },
    ]),

    // low stock items count — unresolved queue entries
    RestockQueueModel.countDocuments({ isResolved: false }),

    // product summary — stock status দিয়ে
    ProductModel.find()
      .select('name stockQuantity minStockThreshold status')
      .sort({ stockQuantity: 1 }) // lowest stock আগে
      .limit(10)
      .lean(),

    // latest 10 activity logs
    ActivityLogModel.find()
      .populate('performedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
  ]);

  // product summary format করো
  const formattedProductSummary = productSummary.map((p) => ({
    name: p.name,
    stock: p.stockQuantity,
    status: p.status,
    stockLabel:
      p.stockQuantity === 0
        ? 'Out of Stock'
        : p.stockQuantity < p.minStockThreshold
        ? 'Low Stock'
        : 'OK',
  }));

  return {
    totalOrdersToday,
    pendingOrders,
    completedOrders,
    revenueToday: revenueToday[0]?.total ?? 0,
    lowStockItemsCount: lowStockCount,
    productSummary: formattedProductSummary,
    recentActivity,
  };
};

// ─── analytics ────────────────────────────────────────────

const getDashboardAnalyticsFromDB = async () => {
  // last 7 days এর range
  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 6);
  last7Days.setHours(0, 0, 0, 0);

  const [ordersLast7Days, topProducts, ordersByStatus] = await Promise.all([

    // প্রতিদিনের order count + revenue
    OrderModel.aggregate([
      {
        $match: {
          createdAt: { $gte: last7Days },
          status: { $ne: 'Cancelled' },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
          revenue: { $sum: '$totalPrice' },
        },
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: '$_id',
          count: 1,
          revenue: 1,
        },
      },
    ]),

    // সবচেয়ে বেশি ordered products
    OrderModel.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          productName: { $first: '$items.productName' },
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.subtotal' },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $project: {
          _id: 0,
          productId: '$_id',
          productName: 1,
          totalSold: 1,
          totalRevenue: 1,
        },
      },
    ]),

    // status অনুযায়ী order breakdown
    OrderModel.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          status: '$_id',
          count: 1,
        },
      },
    ]),
  ]);

  return {
    ordersLast7Days,
    topProducts,
    ordersByStatus,
  };
};

export const DashboardService = {
  getDashboardStatsFromDB,
  getDashboardAnalyticsFromDB,
};