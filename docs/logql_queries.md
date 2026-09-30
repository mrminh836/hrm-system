# 📑 Tài liệu Các câu truy vấn LogQL (Loki + Promtail)

Tài liệu này định nghĩa ít nhất **3 câu truy vấn LogQL chuẩn** dùng để kiểm tra, giám sát và debug hệ thống Quản lý Nhân sự (HRM System) thông qua **Grafana Explore** kết nối với **Loki Data Source**.

---

## 🔍 1. Truy vấn Log Lỗi Ứng dụng (Application Error Logs)
- **Mục đích:** Phát hiện tức thì các ngoại lệ (Exceptions), lỗi máy chủ nội bộ (HTTP 500) hoặc lỗi validation từ Backend Node.js.
- **LogQL Query:**
  ```logql
  {container="hrm-app"} |= "error" or {container="hrm-app"} |= "Error" or {container="hrm-app"} |= "500"
  ```
- **Ví dụ log bắt được:**
  - `[Unhandled Error]: Error: connect ECONNREFUSED`
  - `POST /api/employees 500 12.450 ms - 45`

---

## 🌐 2. Truy vấn Log Truy cập HTTP / REST API (HTTP Request Logs)
- **Mục đích:** Theo dõi chi tiết lưu lượng gọi API vào các dịch vụ quản lý nhân sự, phòng ban, chấm công và thời gian xử lý phản hồi (response time).
- **LogQL Query:**
  ```logql
  {container="hrm-app"} |~ "(GET|POST|PUT|DELETE) /api"
  ```
- **Ví dụ log bắt được:**
  - `GET /api/employees?page=1&limit=10 200 8.120 ms - 1520`
  - `POST /api/attendance/check-in 200 15.300 ms - 110`
  - `PUT /api/departments/1 200 9.400 ms - 85`

---

## 🐬 3. Truy vấn Log Cơ sở dữ liệu MySQL (Database Operations & Health)
- **Mục đích:** Giám sát trạng thái kết nối MySQL, cảnh báo (Warnings) và các sự cố I/O của cơ sở dữ liệu.
- **LogQL Query:**
  ```logql
  {container="hrm-mysql"} |= "ready for connections" or {container="hrm-mysql"} |= "[Warning]" or {container="hrm-mysql"} |= "[ERROR]"
  ```
- **Ví dụ log bắt được:**
  - `[Server] /usr/sbin/mysqld: ready for connections. Version: '8.0.41' socket: '/var/run/mysqld/mysqld.sock' port: 3306`
  - `[Warning] [MY-010915] [Server] 'NO_ZERO_DATE', 'NO_ZERO_IN_DATE' and 'ERROR_FOR_DIVISION_BY_ZERO' sql modes are deprecated`

---

## 🛡️ 4. Truy vấn Log Bảo mật Đăng nhập (Authentication Audit Logs)
- **Mục đích:** Giám sát các lượt đăng nhập, phát hiện các lần xác thực thất bại hoặc nghi ngờ tấn công dò quét mật khẩu (brute-force).
- **LogQL Query:**
  ```logql
  {container="hrm-app"} |= "/api/auth/login"
  ```
- **Ví dụ log bắt được:**
  - `POST /api/auth/login 200 65.230 ms - 240`
  - `POST /api/auth/login 401 54.120 ms - 78`

---

## 💡 Hướng dẫn chạy thử LogQL trên Grafana:
1. Mở Grafana tại: [http://localhost:3000](http://localhost:3000) (User/Pass: `admin` / `admin`).
2. Nhấp vào menu **Explore** (Biểu tượng la bàn ở thanh bên trái).
3. Chọn Data Source: **Loki**.
4. Dán một trong các câu truy vấn trên vào ô nhập lệnh và bấm **Run query**.
