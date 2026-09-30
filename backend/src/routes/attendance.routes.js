const express = require('express');
const router = express.Router();
const {
  checkIn,
  checkOut,
  getTodayStatus,
  getHistory,
  getSummary,
} = require('../controllers/attendance.controller');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

router.post('/check-in', authenticateToken, checkIn);
router.post('/check-out', authenticateToken, checkOut);
router.get('/today', authenticateToken, getTodayStatus);
router.get('/history', authenticateToken, getHistory);
router.get('/summary', authenticateToken, requireAdmin, getSummary);

module.exports = router;
