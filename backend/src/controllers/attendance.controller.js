const { query } = require('../config/db');

// Helper to get employee_id for current user
const getEmployeeIdForUser = async (user) => {
  if (!user) return null;
  const res = await query('SELECT id FROM employees WHERE user_id = ? OR LOWER(email) = LOWER(?)', [user.id, user.email]);
  return res.rows[0]?.id || null;
};

// POST /api/attendance/check-in
const checkIn = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toTimeString().split(' ')[0]; // HH:MM:SS

    let employeeId = req.body.employee_id;
    if (!employeeId) {
      employeeId = await getEmployeeIdForUser(req.user);
    }

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Không tìm thấy hồ sơ nhân viên tương ứng với tài khoản này.',
      });
    }

    const existing = await query(
      'SELECT id, check_in FROM attendances WHERE employee_id = ? AND date = ?',
      [employeeId, today]
    );

    if (existing.rows.length > 0 && existing.rows[0].check_in) {
      return res.status(400).json({
        success: false,
        message: 'Bạn đã thực hiện check-in hôm nay rồi.',
      });
    }

    const hour = parseInt(nowTime.split(':')[0], 10);
    const minute = parseInt(nowTime.split(':')[1], 10);
    const isLate = (hour > 8) || (hour === 8 && minute > 30);
    const status = isLate ? 'late' : 'present';

    let attRecordId;
    if (existing.rows.length > 0) {
      await query(
        `UPDATE attendances 
         SET check_in = ?, status = ?
         WHERE id = ?`,
        [nowTime, status, existing.rows[0].id]
      );
      attRecordId = existing.rows[0].id;
    } else {
      const insRes = await query(
        `INSERT INTO attendances (employee_id, date, check_in, status)
         VALUES (?, ?, ?, ?)`,
        [employeeId, today, nowTime, status]
      );
      attRecordId = insRes.insertId;
    }

    const result = await query('SELECT * FROM attendances WHERE id = ?', [attRecordId]);

    return res.json({
      success: true,
      message: `Check-in thành công lúc ${nowTime} (${status === 'late' ? 'Đi muộn' : 'Đúng giờ'}).`,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('[Check-in Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi thực hiện check-in.',
    });
  }
};

// POST /api/attendance/check-out
const checkOut = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toTimeString().split(' ')[0];

    let employeeId = req.body.employee_id;
    if (!employeeId) {
      employeeId = await getEmployeeIdForUser(req.user);
    }

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: 'Không tìm thấy hồ sơ nhân viên tương ứng với tài khoản này.',
      });
    }

    const existing = await query(
      'SELECT id, check_in, check_out, status FROM attendances WHERE employee_id = ? AND date = ?',
      [employeeId, today]
    );

    if (existing.rows.length === 0 || !existing.rows[0].check_in) {
      return res.status(400).json({
        success: false,
        message: 'Bạn chưa thực hiện Check-in hôm nay, không thể Check-out.',
      });
    }

    if (existing.rows[0].check_out) {
      return res.status(400).json({
        success: false,
        message: 'Bạn đã thực hiện check-out hôm nay rồi.',
      });
    }

    await query(
      `UPDATE attendances
       SET check_out = ?
       WHERE id = ?`,
      [nowTime, existing.rows[0].id]
    );

    const result = await query('SELECT * FROM attendances WHERE id = ?', [existing.rows[0].id]);

    return res.json({
      success: true,
      message: `Check-out thành công lúc ${nowTime}.`,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('[Check-out Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi thực hiện check-out.',
    });
  }
};

// GET /api/attendance/today
const getTodayStatus = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const employeeId = await getEmployeeIdForUser(req.user);

    if (!employeeId) {
      return res.json({
        success: true,
        data: null,
      });
    }

    const result = await query(
      `SELECT a.*, e.full_name, e.employee_code 
       FROM attendances a
       JOIN employees e ON a.employee_id = e.id
       WHERE a.employee_id = ? AND a.date = ?`,
      [employeeId, today]
    );

    return res.json({
      success: true,
      data: result.rows[0] || null,
    });
  } catch (error) {
    console.error('[Get Today Status Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể lấy thông tin chấm công hôm nay.',
    });
  }
};

// GET /api/attendance/history
const getHistory = async (req, res) => {
  try {
    const { month, year, employee_id } = req.query;
    let targetEmployeeId = employee_id;

    if (req.user.role !== 'admin') {
      targetEmployeeId = await getEmployeeIdForUser(req.user);
    }

    const conditions = [];
    const params = [];

    if (targetEmployeeId) {
      conditions.push('a.employee_id = ?');
      params.push(parseInt(targetEmployeeId, 10));
    }

    if (month && year) {
      conditions.push('MONTH(a.date) = ?');
      params.push(parseInt(month, 10));

      conditions.push('YEAR(a.date) = ?');
      params.push(parseInt(year, 10));
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT 
        a.id,
        a.date,
        a.check_in,
        a.check_out,
        a.status,
        a.note,
        e.id AS employee_id,
        e.full_name,
        e.employee_code,
        d.name AS department_name
      FROM attendances a
      JOIN employees e ON a.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
      ${whereClause}
      ORDER BY a.date DESC, a.id DESC
      LIMIT 100
    `;

    const result = await query(sql, params);
    return res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('[Get Attendance History Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy lịch sử chấm công.',
    });
  }
};

// GET /api/attendance/summary
const getSummary = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const month = parseInt(req.query.month, 10) || currentMonth;
    const year = parseInt(req.query.year, 10) || currentYear;
    const department_id = req.query.department_id;

    let depFilter = '';
    const params = [month, year];

    if (department_id) {
      depFilter = 'AND e.department_id = ?';
      params.push(parseInt(department_id, 10));
    }

    const sql = `
      SELECT 
        e.id AS employee_id,
        e.employee_code,
        e.full_name,
        d.name AS department_name,
        COUNT(CASE WHEN a.status = 'present' THEN 1 END) AS present_days,
        COUNT(CASE WHEN a.status = 'late' THEN 1 END) AS late_days,
        COUNT(CASE WHEN a.status = 'early_leave' THEN 1 END) AS early_leave_days,
        COUNT(CASE WHEN a.status = 'absent' THEN 1 END) AS absent_days,
        COUNT(a.id) AS total_recorded_days
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      LEFT JOIN attendances a ON e.id = a.employee_id 
        AND MONTH(a.date) = ? 
        AND YEAR(a.date) = ?
      WHERE 1=1 ${depFilter}
      GROUP BY e.id, e.employee_code, e.full_name, d.name
      ORDER BY e.employee_code ASC
    `;

    const result = await query(sql, params);
    return res.json({
      success: true,
      data: {
        month,
        year,
        items: result.rows,
      },
    });
  } catch (error) {
    console.error('[Attendance Summary Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể tổng hợp bảng chấm công.',
    });
  }
};

// GET /api/attendance/stats/:employeeId
const getEmployeeStats = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const month = parseInt(req.query.month, 10) || currentMonth;
    const year = parseInt(req.query.year, 10) || currentYear;

    const sql = `
      SELECT 
        COUNT(CASE WHEN status = 'present' THEN 1 END) AS present_days,
        COUNT(CASE WHEN status = 'late' THEN 1 END) AS late_days,
        COUNT(CASE WHEN status = 'early_leave' THEN 1 END) AS early_leave_days,
        COUNT(CASE WHEN status = 'absent' THEN 1 END) AS absent_days,
        COUNT(id) AS total_days
      FROM attendances
      WHERE employee_id = ?
        AND MONTH(date) = ?
        AND YEAR(date) = ?
    `;

    const result = await query(sql, [employeeId, month, year]);
    const stats = result.rows[0] || {
      present_days: 0,
      late_days: 0,
      early_leave_days: 0,
      absent_days: 0,
      total_days: 0,
    };

    return res.json({
      success: true,
      data: {
        employee_id: parseInt(employeeId, 10),
        month,
        year,
        ...stats,
      },
    });
  } catch (error) {
    console.error('[Employee Attendance Stats Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể lấy thống kê chấm công nhân viên.',
    });
  }
};

module.exports = {
  checkIn,
  checkOut,
  getTodayStatus,
  getHistory,
  getSummary,
  getEmployeeStats,
};

