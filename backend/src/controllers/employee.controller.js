const { query } = require('../config/db');

// Helper to validate email format
const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Helper to validate phone number (VN format)
const isValidPhone = (phone) => {
  return /(84|0[3|5|7|8|9])+([0-9]{8})\b/.test(phone.replace(/\s+/g, ''));
};

// GET /api/employees
const getEmployees = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      department_id = '',
      status = ''
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const offset = (pageNum - 1) * limitNum;

    const conditions = [];
    const params = [];

    if (search && search.trim() !== '') {
      conditions.push(`(
        LOWER(e.full_name) LIKE ? OR
        LOWER(e.email) LIKE ? OR
        LOWER(e.employee_code) LIKE ? OR
        e.phone LIKE ?
      )`);
      const searchPattern = `%${search.trim().toLowerCase()}%`;
      params.push(searchPattern, searchPattern, searchPattern, `%${search.trim()}%`);
    }

    if (department_id && department_id.trim() !== '') {
      conditions.push('e.department_id = ?');
      params.push(parseInt(department_id, 10));
    }

    if (status && status.trim() !== '') {
      conditions.push('e.status = ?');
      params.push(status.trim());
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count query
    const countQuery = `
      SELECT COUNT(*) AS total
      FROM employees e
      ${whereClause}
    `;
    const countResult = await query(countQuery, params);
    const total = countResult.rows[0].total;

    // Items query
    const itemsQuery = `
      SELECT 
        e.id,
        e.employee_code,
        e.full_name,
        e.email,
        e.phone,
        e.date_of_birth,
        e.gender,
        e.address,
        e.position,
        e.department_id,
        d.name AS department_name,
        d.code AS department_code,
        e.hire_date,
        e.salary,
        e.status,
        e.created_at
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      ${whereClause}
      ORDER BY e.id DESC
      LIMIT ? OFFSET ?
    `;

    const itemsParams = [...params, limitNum, offset];
    const itemsResult = await query(itemsQuery, itemsParams);

    return res.json({
      success: true,
      data: {
        items: itemsResult.rows,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum) || 1,
      }
    });
  } catch (error) {
    console.error('[Get Employees Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể lấy danh sách nhân viên.',
    });
  }
};

// GET /api/employees/:id
const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;

    const empSql = `
      SELECT 
        e.id,
        e.employee_code,
        e.full_name,
        e.email,
        e.phone,
        e.date_of_birth,
        e.gender,
        e.address,
        e.position,
        e.department_id,
        d.name AS department_name,
        d.code AS department_code,
        e.hire_date,
        e.salary,
        e.status,
        e.created_at,
        e.updated_at
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE e.id = ?
    `;
    const empResult = await query(empSql, [id]);

    if (empResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thông tin nhân viên.',
      });
    }

    // Recent attendances
    const attSql = `
      SELECT id, date, check_in, check_out, status, note
      FROM attendances
      WHERE employee_id = ?
      ORDER BY date DESC
      LIMIT 10
    `;
    const attResult = await query(attSql, [id]);

    return res.json({
      success: true,
      data: {
        ...empResult.rows[0],
        recentAttendances: attResult.rows,
      }
    });
  } catch (error) {
    console.error('[Get Employee By ID Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy chi tiết nhân viên.',
    });
  }
};

// POST /api/employees (Admin only)
const createEmployee = async (req, res) => {
  try {
    const {
      full_name,
      email,
      phone,
      date_of_birth,
      gender = 'Nam',
      address,
      position = 'Nhân viên',
      department_id,
      hire_date,
      salary = 0,
      status = 'active',
    } = req.body;

    if (!full_name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Họ tên, email và số điện thoại là bắt buộc.',
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Địa chỉ email không hợp lệ.',
      });
    }

    const emailExist = await query(
      'SELECT id FROM employees WHERE LOWER(email) = LOWER(?)',
      [email.trim()]
    );
    if (emailExist.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email này đã tồn tại trong danh sách nhân viên.',
      });
    }

    let depId = department_id ? parseInt(department_id, 10) : null;
    if (depId) {
      const depCheck = await query('SELECT id FROM departments WHERE id = ?', [depId]);
      if (depCheck.rows.length === 0) {
        depId = null;
      }
    }

    const codeResult = await query('SELECT MAX(id) as max_id FROM employees');
    const nextNum = (codeResult.rows[0].max_id || 0) + 1;
    const employee_code = `EMP-${String(nextNum).padStart(3, '0')}`;

    const insertSql = `
      INSERT INTO employees (
        employee_code, full_name, email, phone, date_of_birth, gender,
        address, position, department_id, hire_date, salary, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const insertRes = await query(insertSql, [
      employee_code,
      full_name.trim(),
      email.toLowerCase().trim(),
      phone.trim(),
      date_of_birth || null,
      gender,
      address?.trim() || null,
      position?.trim() || 'Nhân viên',
      depId,
      hire_date || new Date().toISOString().split('T')[0],
      salary || 0,
      status,
    ]);

    const createdEmp = await query('SELECT * FROM employees WHERE id = ?', [insertRes.insertId]);

    return res.status(201).json({
      success: true,
      message: 'Thêm nhân viên mới thành công.',
      data: createdEmp.rows[0],
    });
  } catch (error) {
    console.error('[Create Employee Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể thêm nhân viên mới.',
    });
  }
};

// PUT /api/employees/:id (Admin only)
const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      full_name,
      email,
      phone,
      date_of_birth,
      gender,
      address,
      position,
      department_id,
      hire_date,
      salary,
      status,
    } = req.body;

    if (!full_name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Họ tên, email và số điện thoại là bắt buộc.',
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Địa chỉ email không hợp lệ.',
      });
    }

    const emailConflict = await query(
      'SELECT id FROM employees WHERE LOWER(email) = LOWER(?) AND id != ?',
      [email.trim(), id]
    );
    if (emailConflict.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Email này đang thuộc về nhân viên khác.',
      });
    }

    let depId = department_id ? parseInt(department_id, 10) : null;

    const updateSql = `
      UPDATE employees
      SET 
        full_name = ?,
        email = ?,
        phone = ?,
        date_of_birth = ?,
        gender = ?,
        address = ?,
        position = ?,
        department_id = ?,
        hire_date = ?,
        salary = ?,
        status = ?
      WHERE id = ?
    `;

    await query(updateSql, [
      full_name.trim(),
      email.toLowerCase().trim(),
      phone.trim(),
      date_of_birth || null,
      gender || 'Nam',
      address?.trim() || null,
      position?.trim() || 'Nhân viên',
      depId,
      hire_date || null,
      salary || 0,
      status || 'active',
      id,
    ]);

    const updated = await query('SELECT * FROM employees WHERE id = ?', [id]);
    if (updated.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhân viên để cập nhật.',
      });
    }

    return res.json({
      success: true,
      message: 'Cập nhật thông tin nhân viên thành công.',
      data: updated.rows[0],
    });
  } catch (error) {
    console.error('[Update Employee Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể cập nhật thông tin nhân viên.',
    });
  }
};

// DELETE /api/employees/:id (Admin only)
const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const emp = await query('SELECT full_name, employee_code FROM employees WHERE id = ?', [id]);
    if (emp.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nhân viên cần xóa.',
      });
    }

    await query('DELETE FROM employees WHERE id = ?', [id]);

    return res.json({
      success: true,
      message: `Đã xóa nhân viên ${emp.rows[0].full_name} (${emp.rows[0].employee_code}) thành công.`,
    });
  } catch (error) {
    console.error('[Delete Employee Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Không thể xóa nhân viên.',
    });
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
