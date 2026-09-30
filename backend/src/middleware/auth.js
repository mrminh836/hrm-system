const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_hrm_2026_qminh';

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Bạn chưa đăng nhập hoặc thiếu token xác thực.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const userRes = await query(
      'SELECT id, email, full_name, role FROM users WHERE id = ?',
      [decoded.id]
    );

    if (userRes.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản không tồn tại hoặc đã bị vô hiệu hóa.'
      });
    }

    req.user = userRes.rows[0];
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.'
    });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Truy cập bị từ chối: Yêu cầu quyền Quản trị viên (Admin).'
    });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
  JWT_SECRET,
};
