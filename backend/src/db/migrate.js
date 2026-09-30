const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { pool, query } = require('../config/db');

async function migrateAndSeed() {
  console.log('[Migration] Bắt đầu migration & seed dữ liệu trên MySQL...');
  try {
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    
    // Split SQL by semicolon to execute statement by statement
    const statements = schemaSql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    for (const statement of statements) {
      await query(statement);
    }
    console.log('[Migration] Cấu trúc bảng MySQL đã được tạo / kiểm tra thành công.');

    // 1. Seed Admin User
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@hrm.local';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';
    const adminName = process.env.ADMIN_NAME || 'Đỗ Quang Minh (Admin)';

    const existingAdmin = await query('SELECT id FROM users WHERE email = ?', [adminEmail]);
    let adminUserId;

    if (existingAdmin.rows.length === 0) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      const res = await query(
        `INSERT INTO users (email, password, full_name, role)
         VALUES (?, ?, ?, 'admin')`,
        [adminEmail, hashedPassword, adminName]
      );
      adminUserId = res.insertId;
      console.log(`[Seed] Đã tạo tài khoản quản trị mặc định: ${adminEmail}`);
    } else {
      adminUserId = existingAdmin.rows[0].id;
    }

    // 2. Seed Departments
    const sampleDepartments = [
      { name: 'Phòng Công nghệ Thông tin (IT)', code: 'DEP-IT', description: 'Phát triển & vận hành hệ thống phần mềm, hạ tầng kỹ thuật', manager_name: 'Đỗ Quang Minh' },
      { name: 'Phòng Nhân sự (HR)', code: 'DEP-HR', description: 'Tuyển dụng, đào tạo, chế độ đãi ngộ & văn hóa doanh nghiệp', manager_name: 'Nguyễn Thị Mai' },
      { name: 'Phòng Kinh doanh (Sales)', code: 'DEP-SALES', description: 'Phát triển thị trường, tìm kiếm khách hàng & doanh số', manager_name: 'Trần Văn Hoàng' },
      { name: 'Phòng Kế toán & Tài chính', code: 'DEP-ACC', description: 'Quản lý thu chi, báo cáo tài chính & bảng lương', manager_name: 'Lê Thu Trang' },
      { name: 'Phòng Marketing', code: 'DEP-MKT', description: 'Chiến dịch truyền thông, thương hiệu & quan hệ đối tác', manager_name: 'Phạm Đức Anh' }
    ];

    for (const dep of sampleDepartments) {
      const existingDep = await query('SELECT id FROM departments WHERE code = ?', [dep.code]);
      if (existingDep.rows.length === 0) {
        await query(
          `INSERT INTO departments (name, code, description, manager_name)
           VALUES (?, ?, ?, ?)`,
          [dep.name, dep.code, dep.description, dep.manager_name]
        );
      }
    }
    console.log('[Seed] Danh mục phòng ban mẫu đã sẵn sàng.');

    // 3. Seed Sample Employees
    const empCount = await query('SELECT COUNT(*) AS total FROM employees');
    if (empCount.rows[0].total === 0) {
      const itDep = await query("SELECT id FROM departments WHERE code = 'DEP-IT'");
      const hrDep = await query("SELECT id FROM departments WHERE code = 'DEP-HR'");
      const salesDep = await query("SELECT id FROM departments WHERE code = 'DEP-SALES'");

      const itId = itDep.rows[0]?.id || null;
      const hrId = hrDep.rows[0]?.id || null;
      const salesId = salesDep.rows[0]?.id || null;

      const sampleEmployees = [
        {
          code: 'EMP-001',
          name: 'Đỗ Quang Minh',
          email: adminEmail,
          phone: '0988123456',
          dob: '1995-05-15',
          gender: 'Nam',
          address: 'Hà Nội, Việt Nam',
          position: 'Giám đốc Công nghệ (CTO)',
          depId: itId,
          userId: adminUserId,
          salary: 35000000,
          status: 'active'
        },
        {
          code: 'EMP-002',
          name: 'Nguyễn Thị Mai',
          email: 'mai.nguyen@hrm.local',
          phone: '0977234567',
          dob: '1996-08-20',
          gender: 'Nữ',
          address: 'Cầu Giấy, Hà Nội',
          position: 'Trưởng phòng Nhân sự',
          depId: hrId,
          userId: null,
          salary: 22000000,
          status: 'active'
        },
        {
          code: 'EMP-003',
          name: 'Trần Văn Hoàng',
          email: 'hoang.tran@hrm.local',
          phone: '0912345678',
          dob: '1994-11-10',
          gender: 'Nam',
          address: 'Ba Đình, Hà Nội',
          position: 'Trưởng phòng Kinh doanh',
          depId: salesId,
          userId: null,
          salary: 25000000,
          status: 'active'
        },
        {
          code: 'EMP-004',
          name: 'Lê Thu Trang',
          email: 'trang.le@hrm.local',
          phone: '0933456789',
          dob: '1998-03-25',
          gender: 'Nữ',
          address: 'Đống Đa, Hà Nội',
          position: 'Chuyên viên Kế toán',
          depId: hrId,
          userId: null,
          salary: 14000000,
          status: 'active'
        },
        {
          code: 'EMP-005',
          name: 'Phạm Đức Anh',
          email: 'anh.pham@hrm.local',
          phone: '0909567890',
          dob: '1999-07-12',
          gender: 'Nam',
          address: 'Thanh Xuân, Hà Nội',
          position: 'Kỹ sư Phần mềm',
          depId: itId,
          userId: null,
          salary: 18000000,
          status: 'active'
        }
      ];

      for (const emp of sampleEmployees) {
        await query(
          `INSERT INTO employees (
            employee_code, full_name, email, phone, date_of_birth, gender,
            address, position, department_id, user_id, salary, status, hire_date
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE())`,
          [
            emp.code, emp.name, emp.email, emp.phone, emp.dob, emp.gender,
            emp.address, emp.position, emp.depId, emp.userId, emp.salary, emp.status
          ]
        );
      }
      console.log(`[Seed] Đã tạo ${sampleEmployees.length} nhân viên mẫu.`);
    }

    console.log('[Migration] Khởi tạo cơ sở dữ liệu MySQL hoàn tất.');
  } catch (error) {
    console.error('[Migration] Lỗi khi migration:', error.message);
    throw error;
  }
}

if (require.main === module) {
  migrateAndSeed()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = migrateAndSeed;
