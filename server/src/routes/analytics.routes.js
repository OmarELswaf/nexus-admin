const express = require('express');
const { state } = require('../store');
const { requireAuth } = require('../auth');

const router = express.Router();
router.use(requireAuth);

// Dashboard overview: KPIs, 90-day revenue/signup series, recent orders,
// order-status breakdown. All computed from the (demo) data set.
router.get('/overview', (req, res) => {
  const now = Date.now();
  const monthAgo = now - 30 * 24 * 60 * 60 * 1000;

  const recent = state.orders.filter((o) => new Date(o.createdAt).getTime() >= monthAgo);
  const revenue30d = recent
    .filter((o) => o.status !== 'cancelled')
    .reduce((s, o) => s + o.total, 0);
  const openOrders = state.orders.filter((o) => o.status === 'pending' || o.status === 'paid').length;

  const statusBreakdown = state.orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  res.json({
    kpis: {
      revenue30d: Math.round(revenue30d * 100) / 100,
      orders30d: recent.length,
      totalOrders: state.orders.length,
      openOrders,
      products: state.products.length,
      activeProducts: state.products.filter((p) => p.active).length,
      users: state.users.length,
    },
    series: state.series,
    statusBreakdown,
    recentOrders: state.orders.slice(0, 8),
    demo: true,
  });
});

module.exports = router;
