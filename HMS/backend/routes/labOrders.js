// backend/routes/labOrders.js
const express = require('express');
const router = express.Router();

// In-memory store (replace with MongoDB/MySQL later)
let labOrders = [];

// ─────────────────────────────────────────────
// GET /api/lab-orders  → list all lab orders
// ─────────────────────────────────────────────
router.get('/', (req, res) => {
  res.json(labOrders);
});

// ─────────────────────────────────────────────
// GET /api/lab-orders/:id  → single order
// ─────────────────────────────────────────────
router.get('/:id', (req, res) => {
  const order = labOrders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(order);
});

// ─────────────────────────────────────────────
// POST /api/lab-orders  → create new order
// ─────────────────────────────────────────────
router.post('/', (req, res) => {
  try {
    const order = {
      id: `ORD-${Date.now()}`,
      ...req.body,
      createdAt: new Date().toISOString(),
    };
    labOrders.push(order);
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────
// PATCH /api/lab-orders/:id  → update status
// ─────────────────────────────────────────────
router.patch('/:id', (req, res) => {
  const order = labOrders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  Object.assign(order, req.body, { updatedAt: new Date().toISOString() });
  res.json(order);
});

// ─────────────────────────────────────────────
// DELETE /api/lab-orders/:id
// ─────────────────────────────────────────────
router.delete('/:id', (req, res) => {
  const index = labOrders.findIndex((o) => o.id === req.params.id);
  if (index === -1) return res.status(404).json({ message: 'Order not found' });
  const [deleted] = labOrders.splice(index, 1);
  res.json(deleted);
});

module.exports = router;