const { query } = require('../config/db');

// GET /api/departments
const getDepartments = async (req, res) => {
  try {
    const sql = `
      SELECT 
        d.id, 
        d.name, 
        d.code, 
        d.description, 
        d.manager_name, 
        d.created_at,
        COUNT(e.id) AS employee_count
      FROM departments d
      LEFT JOIN employees e ON d.id = e.department_id
      GROUP BY d.id, d.name, d.code, d.description, d.manager_name, d.created_at
      ORDER BY d.id ASC
    `;
    const result = await query(sql);
    return res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error('[Get Departments Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách phòng ban.',
    });
  }
};

// GET /api/departments/:id
const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const depRes = await query('SELECT * FROM departments WHERE id = ?', [id]);

    if (depRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phòng ban.',
      });
    }

    const empRes = await query(
      `SELECT id, employee_code, full_name, email, phone, position, status 
       FROM employees 
       WHERE department_id = ? 
       ORDER BY full_name ASC`,
      [id]
    );

    return res.json({
      success: true,
      data: {
        ...depRes.rows[0],
        employees: empRes.rows,
      },
    });
  } catch (error) {
    console.error('[Get Department By ID Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin phòng ban.',
    });
  }
};

// POST /api/departments (Admin only)
const createDepartment = async (req, res) => {
  try {
    const { name, code, description, manager_name } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: 'Tên phòng ban và mã phòng ban không được để trống.',
      });
    }

    const existing = await query(
      'SELECT id FROM departments WHERE UPPER(code) = UPPER(?) OR LOWER(name) = LOWER(?)',
      [code.trim(), name.trim()]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Tên hoặc mã phòng ban đã tồn tại trên hệ thống.',
      });
    }

    const result = await query(
      `INSERT INTO departments (name, code, description, manager_name)
       VALUES (?, ?, ?, ?)`,
      [name.trim(), code.trim().toUpperCase(), description?.trim() || null, manager_name?.trim() || null]
    );

    const newDep = await query('SELECT * FROM departments WHERE id = ?', [result.insertId]);

    return res.status(201).json({
      success: true,
      message: 'Tạo phòng ban mới thành công.',
      data: newDep.rows[0],
    });
  } catch (error) {
    console.error('[Create Department Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể tạo phòng ban mới.',
    });
  }
};

// PUT /api/departments/:id (Admin only)
const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, description, manager_name } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: 'Tên phòng ban và mã phòng ban không được để trống.',
      });
    }

    const conflict = await query(
      'SELECT id FROM departments WHERE (UPPER(code) = UPPER(?) OR LOWER(name) = LOWER(?)) AND id != ?',
      [code.trim(), name.trim(), id]
    );

    if (conflict.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Tên hoặc mã phòng ban bị trùng lặp với phòng ban khác.',
      });
    }

    await query(
      `UPDATE departments
       SET name = ?, code = ?, description = ?, manager_name = ?
       WHERE id = ?`,
      [name.trim(), code.trim().toUpperCase(), description?.trim() || null, manager_name?.trim() || null, id]
    );

    const updated = await query('SELECT * FROM departments WHERE id = ?', [id]);
    if (updated.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phòng ban để cập nhật.',
      });
    }

    return res.json({
      success: true,
      message: 'Cập nhật phòng ban thành công.',
      data: updated.rows[0],
    });
  } catch (error) {
    console.error('[Update Department Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể cập nhật phòng ban.',
    });
  }
};

// DELETE /api/departments/:id (Admin only)
const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    const depCheck = await query('SELECT name FROM departments WHERE id = ?', [id]);
    if (depCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phòng ban cần xóa.',
      });
    }

    const empCheck = await query(
      'SELECT COUNT(*) AS count FROM employees WHERE department_id = ?',
      [id]
    );

    const empCount = empCheck.rows[0].count;
    if (empCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Không thể xóa phòng ban "${depCheck.rows[0].name}" vì đang có ${empCount} nhân viên thuộc phòng ban này. Vui lòng chuyển nhân viên sang phòng ban khác trước.`,
      });
    }

    await query('DELETE FROM departments WHERE id = ?', [id]);

    return res.json({
      success: true,
      message: `Đã xóa phòng ban "${depCheck.rows[0].name}" thành công.`,
    });
  } catch (error) {
    console.error('[Delete Department Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa phòng ban.',
    });
  }
};

module.exports = {
  getDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
