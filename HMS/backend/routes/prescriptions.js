// backend/routes/prescriptions.js
const express = require('express');
const router = express.Router();

// In-memory store — replace with DB later
let prescriptions = [];

// ─────────────────────────────────────────────
// GET /api/prescriptions
//   Query params:
//     ?status=pending|dispensed|partially_dispensed|cancelled
//     ?pharmacyId=xxx
// ─────────────────────────────────────────────
router.get('/', (req, res) => {
  const { status } = req.query;
  let result = [...prescriptions];
  if (status) result = result.filter((p) => p.status === status);
  // newest first
  result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(result);
});

// ─────────────────────────────────────────────
// GET /api/prescriptions/:id
// ─────────────────────────────────────────────
router.get('/:id', (req, res) => {
  const rx = prescriptions.find((p) => p.id === req.params.id);
  if (!rx) return res.status(404).json({ message: 'Prescription not found' });
  res.json(rx);
});

// ─────────────────────────────────────────────
// POST /api/prescriptions   (called by doctor)
// ─────────────────────────────────────────────
router.post('/', (req, res) => {
  try {
    const rx = {
      id: `RX-${Date.now()}`,
      ...req.body,
      status: 'pending',          // pharmacy will change this
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dispensedBy: null,
      dispensedAt: null,
    };
    prescriptions.push(rx);
    res.status(201).json(rx);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ─────────────────────────────────────────────
// PATCH /api/prescriptions/:id/status  (pharmacy)
//   body: { status, dispensedBy, notes }
// ─────────────────────────────────────────────
router.patch('/:id/status', (req, res) => {
  const rx = prescriptions.find((p) => p.id === req.params.id);
  if (!rx) return res.status(404).json({ message: 'Prescription not found' });

  const { status, dispensedBy, notes } = req.body;
  const allowed = ['pending', 'dispensed', 'partially_dispensed', 'cancelled'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: `Invalid status: ${status}` });
  }

  rx.status = status;
  rx.updatedAt = new Date().toISOString();
  if (dispensedBy) rx.dispensedBy = dispensedBy;
  if (notes) rx.pharmacyNotes = notes;
  if (status === 'dispensed' || status === 'partially_dispensed') {
    rx.dispensedAt = new Date().toISOString();
  }

  res.json(rx);
});

module.exports = router;