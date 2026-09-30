const express = require('express');
const router = express.Router();
const {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} = require('../controllers/employee.controller');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

router.get('/', authenticateToken, getEmployees);
router.get('/:id', authenticateToken, getEmployeeById);
router.post('/', authenticateToken, requireAdmin, createEmployee);
router.put('/:id', authenticateToken, requireAdmin, updateEmployee);
router.delete('/:id', authenticateToken, requireAdmin, deleteEmployee);

module.exports = router;
