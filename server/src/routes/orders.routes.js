const express = require('express');
const { state, persist } = require('../store');
const { requireAuth, requireRole } = require('../auth');
const { validate, updateOrderSchema } = require('../validate');

const router = express.Router();
router.use(requireAuth);

// GET /api/orders?status=paid&page=1&pageSize=10&q=smith
router.get('/', (req, res) => {
  const { status, q } = req.query;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const pageSize = Math.min(50, Math.max(1, parseInt(req.query.pageSize, 10) || 10));

  let rows = state.orders;
  if (status) rows = rows.filter((o) => o.status === status);
  if (q) {
    const needle = String(q).toLowerCase();
    rows = rows.filter(
      (o) => o.customer.name.toLowerCase().includes(needle) || o.id.toLowerCase().includes(needle)
    );
  }

  const total = rows.length;
  const items = rows.slice((page - 1) * pageSize, page * pageSize);
  res.json({ orders: items, total, page, pageSize, pages: Math.ceil(total / pageSize) });
});

// Update order status (manager and up).
router.patch('/:id', requireRole('manager', 'admin'), validate(updateOrderSchema), (req, res) => {
  const order = state.orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'not_found', message: 'Order not found' });
  order.status = req.body.status;
  persist();
  res.json({ order });
});

module.exports = router;
