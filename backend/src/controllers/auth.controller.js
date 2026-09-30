const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');

const register = async (req, res) => {
  try {
    const { email, password, full_name, role = 'employee' } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ email, mật khẩu và họ tên.'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Địa chỉ email không đúng định dạng.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu phải có độ dài tối thiểu 6 ký tự.'
      });
    }

    const existing = await query('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email này đã được sử dụng trong hệ thống.'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const assignedRole = role === 'admin' ? 'admin' : 'employee';

    const insertResult = await query(
      `INSERT INTO users (email, password, full_name, role)
       VALUES (?, ?, ?, ?)`,
      [email.toLowerCase().trim(), hashedPassword, full_name.trim(), assignedRole]
    );

    const newUserId = insertResult.insertId;

    const token = jwt.sign(
      { id: newUserId, email: email.toLowerCase().trim(), role: assignedRole },
      JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công.',
      data: {
        token,
        user: {
          id: newUserId,
          email: email.toLowerCase().trim(),
          full_name: full_name.trim(),
          role: assignedRole
        }
      }
    });
  } catch (error) {
    console.error('[Auth Register Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi xử lý đăng ký tài khoản.'
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ email và mật khẩu.'
      });
    }

    const result = await query(
      'SELECT id, email, password, full_name, role FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không chính xác.'
      });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không chính xác.'
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.json({
      success: true,
      message: 'Đăng nhập thành công.',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role
        }
      }
    });
  } catch (error) {
    console.error('[Auth Login Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi máy chủ khi xử lý đăng nhập.'
    });
  }
};

const getMe = async (req, res) => {
  try {
    return res.json({
      success: true,
      data: req.user
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin người dùng.'
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
};
