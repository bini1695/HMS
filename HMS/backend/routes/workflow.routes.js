const express = require('express');
const workflowController = require('../controllers/workflowController');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);
router.get('/summary', workflowController.summary);
router.get('/appointments', requireRole('admin', 'doctor', 'patient', 'receptionist'), workflowController.appointments);
router.post('/appointments', requireRole('admin', 'doctor', 'receptionist'), workflowController.createAppointment);
router.get('/patients/:patientId/history', requireRole('admin', 'doctor', 'patient'), workflowController.patientHistory);
router.post('/records', requireRole('admin', 'doctor'), workflowController.createRecord);
router.post('/lab-orders', requireRole('admin', 'doctor'), workflowController.createLabOrder);
router.post('/prescriptions', requireRole('admin', 'doctor'), workflowController.createPrescription);
router.post('/vitals', requireRole('admin', 'nurse'), workflowController.createVitals);
router.patch('/lab-orders/:id/result', requireRole('admin', 'lab_technician'), workflowController.updateLabResult);
router.get('/inventory', requireRole('admin', 'pharmacist'), workflowController.listInventory);
router.get('/bills', requireRole('admin', 'billing', 'patient'), workflowController.listBills);

module.exports = router;