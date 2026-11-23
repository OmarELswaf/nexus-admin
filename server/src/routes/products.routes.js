const express = require('express');
const { state, persist, nextId } = require('../store');
const { requireAuth, requireRole } = require('../auth');
const { validate, createProductSchema } = require('../validate');

const router = express.Router();
router.use(requireAuth);

router.get('/', (req, res) => {
  res.json({ products: state.products });
});

router.post('/', requireRole('manager', 'admin'), validate(createProductSchema), (req, res) => {
  const product = {
    id: nextId('prd', state.products),
    ...req.body,
    active: true,
    createdAt: new Date().toISOString(),
  };
  state.products.push(product);
  persist();
  res.status(201).json({ product });
});

router.patch('/:id', requireRole('manager', 'admin'), (req, res) => {
  const product = state.products.find((p) => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'not_found', message: 'Product not found' });
  const allowed = ['name', 'category', 'price', 'stock', 'active'];
  for (const key of allowed) {
    if (req.body[key] !== undefined) product[key] = req.body[key];
  }
  persist();
  res.json({ product });
});

module.exports = router;
