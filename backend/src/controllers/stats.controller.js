const { query } = require('../config/db');

const getDashboardStats = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Total employees
    const empTotal = await query('SELECT COUNT(*) AS count FROM employees');
    const empActive = await query("SELECT COUNT(*) AS count FROM employees WHERE status = 'active'");
    const depTotal = await query('SELECT COUNT(*) AS count FROM departments');
    
    // Today's attendance
    const attToday = await query(
      `SELECT 
        COUNT(*) AS total_checked,
        COUNT(CASE WHEN status = 'present' THEN 1 END) AS present_count,
        COUNT(CASE WHEN status = 'late' THEN 1 END) AS late_count
       FROM attendances WHERE date = ?`,
      [today]
    );

    // Employees by department
    const depStats = await query(
      `SELECT d.name, COUNT(e.id) AS employee_count
       FROM departments d
       LEFT JOIN employees e ON d.id = e.department_id
       GROUP BY d.id, d.name
       ORDER BY employee_count DESC`
    );

    // Latest employees
    const recentEmployees = await query(
      `SELECT e.id, e.employee_code, e.full_name, e.position, e.hire_date, d.name AS department_name
       FROM employees e
       LEFT JOIN departments d ON e.department_id = d.id
       ORDER BY e.id DESC
       LIMIT 5`
    );

    return res.json({
      success: true,
      data: {
        totalEmployees: empTotal.rows[0].count,
        activeEmployees: empActive.rows[0].count,
        totalDepartments: depTotal.rows[0].count,
        todayAttendance: attToday.rows[0] || { total_checked: 0, present_count: 0, late_count: 0 },
        departmentDistribution: depStats.rows,
        recentEmployees: recentEmployees.rows,
      }
    });
  } catch (error) {
    console.error('[Dashboard Stats Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy dữ liệu thống kê tổng quan.',
    });
  }
};

module.exports = {
  getDashboardStats,
};
