const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { requireAuth, requireRole } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', userController.listUsers);
router.get('/:id', userController.getUser);
router.post('/', requireRole('admin'), userController.createUser);
router.put('/:id', requireRole('admin'), userController.updateUser);
router.delete('/:id', requireRole('admin'), userController.deleteUser);

module.exports = router;
