# ⚡ Hệ thống Quản lý Nhân sự (HRM System)

> **Hệ thống Quản lý Nhân sự (HRM)** đơn giản, hiệu quả và hiện đại, giúp doanh nghiệp quản lý thông tin nhân viên, cơ cấu tổ chức phòng ban và chấm công một cách chính xác, minh bạch — đóng gói triển khai toàn bộ bằng **Docker Compose** với hạ tầng giám sát và bảo mật hoàn chỉnh.

---

## 📋 Mục lục
1. [Giới thiệu & Tính năng chính](#-giới-thiệu--tính-năng-chính)
2. [Ngăn xếp công nghệ (Tech Stack)](#-ngăn-xếp-công-nghệ-tech-stack)
3. [Cấu trúc thư mục dự án](#-cấu-trúc-thư-mục-dự-án)
4. [Tài khoản mặc định](#-tài-khoản-mặc-định)
5. [Hướng dẫn cài đặt & Khởi chạy](#-hướng-dẫn-cài-đặt--khởi-chạy)
   - [Cách 1: Triển khai với Docker Compose (Khuyên dùng)](#cách-1-triển-khai-với-docker-compose-khuyên-dùng)
   - [Cách 2: Chạy trực tiếp (Local Development)](#cách-2-chạy-trực-tiếp-local-development)
6. [Danh sách API Endpoints](#-danh-sách-api-endpoints)
7. [Tiến độ Sprint & Kế hoạch phát triển](#-tiến-độ-sprint--kế-hoạch-phát-triển)

---

## 🌟 Giới thiệu & Tính năng chính

### 👥 1. Quản lý nhân sự (Employee Management)
- Thêm nhân viên mới với đầy đủ thông tin: Mã NV, họ tên, email, SĐT, ngày sinh, giới tính, địa chỉ, vị trí, phòng ban, mức lương.
- Danh sách nhân viên phân trang, tìm kiếm tức thì theo tên/email/mã NV/SĐT, lọc theo phòng ban và trạng thái (Đang làm việc, Thử việc, Tạm nghỉ, Đã nghỉ việc).
- Chỉnh sửa thông tin nhân viên, xóa hồ sơ với xác nhận an toàn.
- Xem chi tiết hồ sơ cá nhân và lịch sử chấm công tương ứng.

### 🏢 2. Quản lý phòng ban (Department Management)
- CRUD phòng ban (Tên, mã phòng ban, trưởng phòng, mô tả chức năng).
- Thống kê tự động số lượng nhân viên thuộc từng phòng ban.
- Cơ chế bảo vệ toàn vẹn dữ liệu: Không cho phép xóa phòng ban khi vẫn còn nhân sự trực thuộc.

### ⏱️ 3. Chấm công & Điểm danh (Attendance)
- Check-in (Vào ca) & Check-out (Tan ca) hàng ngày theo thời gian thực.
- Tự động nhận diện trạng thái Đúng giờ / Đi muộn dựa theo quy định ca làm việc.
- Xem lịch sử chấm công cá nhân theo tháng/năm.
- Bảng tổng hợp công nhân viên toàn công ty dành cho Quản lý.

### 🔐 4. Xác thực & Phân quyền (Authentication & Authorization)
- Đăng nhập bảo mật bằng JWT (JSON Web Token), mã hóa mật khẩu bằng `bcryptjs`.
- Phân quyền theo vai trò: `Admin` (Quản trị viên) và `Employee` (Nhân viên).

---

## 🛠 Ngăn xếp công nghệ (Tech Stack)

| Thành phần | Công nghệ sử dụng |
| :--- | :--- |
| **Backend** | Node.js (v20+ / v22), Express.js |
| **Database** | MySQL 8.0 |
| **DB GUI Tool** | phpMyAdmin |
| **Frontend** | Vanilla HTML5, Modern CSS3 (Variables, Flexbox/Grid, Glassmorphism), Vanilla JavaScript ES6+ |
| **Authentication** | JWT (jsonwebtoken), bcryptjs |
| **Containerization**| Docker, Docker Compose |
| **Monitoring Ready**| Prometheus Metrics (`/metrics`), cAdvisor, Grafana |
| **Reverse Proxy** | Nginx (chuẩn bị cho Sprint 2 HTTPS) |

---

## 📁 Cấu trúc thư mục dự án

```text
Hệ thống Quản lý Nhân sự (HRM)/
├── backend/
│   └── src/
│       ├── config/
│       │   └── db.js                  # Cấu hình Pool kết nối MySQL
│       ├── controllers/
│       │   ├── attendance.controller.js  # Controller chấm công
│       │   ├── auth.controller.js        # Controller đăng nhập, đăng ký
│       │   ├── department.controller.js  # Controller phòng ban
│       │   ├── employee.controller.js    # Controller nhân viên
│       │   └── stats.controller.js       # Controller thống kê tổng quan
│       ├── db/
│       │   ├── schema.sql             # Script khởi tạo bảng MySQL
│       │   └── migrate.js             # Migration & seed tài khoản, dữ liệu mẫu
│       ├── middleware/
│       │   └── auth.js                # Middleware xác thực JWT & role Admin
│       ├── routes/
│       │   ├── attendance.routes.js
│       │   ├── auth.routes.js
│       │   ├── department.routes.js
│       │   ├── employee.routes.js
│       │   └── stats.routes.js
│       └── server.js                  # Entry point Express app & metrics
├── frontend/
│   ├── assets/
│   │   ├── css/
│   │   │   └── main.css               # Design System toàn diện cho HRM
│   │   └── js/
│   │       ├── api.js                 # HTTP fetch wrapper, Toast alerts, Auth storage
│   │       └── components.js          # Sidebar, Navbar & Logout components
│   ├── pages/
│   │   ├── attendance.html            # Trang chấm công & bảng công
│   │   ├── dashboard.html             # Trang bảng điều khiển tổng quan
│   │   ├── departments.html           # Trang quản lý phòng ban
│   │   ├── employee-detail.html       # Trang hồ sơ chi tiết nhân viên
│   │   ├── employees.html             # Trang danh sách & thêm/sửa nhân viên
│   │   └── login.html                 # Trang đăng nhập hiện đại
│   └── index.html                     # Trang điều hướng chính
├── docs/
│   ├── Product_Backlog_HRM_System.xlsx      # Product Backlog v1
│   └── Product_Backlog_HRM_System_v2.xlsx   # Product Backlog v2 (MySQL + phpMyAdmin)
├── .env.example                       # Biến môi trường mẫu
├── .env                               # File cấu hình môi trường
├── .gitignore                         # Danh sách file loại trừ khỏi Git
├── docker-compose.yml                 # Khởi chạy toàn bộ hệ thống bằng 1 lệnh
├── Dockerfile                         # Build image Node.js non-root bảo mật
└── package.json                       # Định nghĩa dependencies và npm scripts
```

---

## 🔑 Tài khoản mặc định

| Hệ thống | Đường dẫn | Tài khoản | Mật khẩu | Ghi chú |
| :--- | :--- | :--- | :--- | :--- |
| **HRM Web App** | `http://localhost:5000` | `admin@hrm.local` | `Admin@123` | Quyền Quản trị viên (Admin) |
| **phpMyAdmin** | `http://localhost:8080` | `hrm_user` | `hrm_secure_password_2026` | Máy chủ: `hrm-mysql` |
| **MySQL Root** | Port `3306` | `root` | `hrm_root_secure_2026` | Quản trị cấp cao DB |

---

## 🚀 Hướng dẫn cài đặt & Khởi chạy

### Cách 1: Triển khai với Docker Compose (Khuyên dùng)

Yêu cầu máy tính đã cài đặt **Docker** và **Docker Compose**.

1. **Khởi chạy toàn bộ dịch vụ (Web app + MySQL + phpMyAdmin):**
   ```bash
   docker compose up -d --build
   ```

2. **Kiểm tra trạng thái các container:**
   ```bash
   docker compose ps
   ```

3. **Truy cập ứng dụng:**
   - Ứng dụng HRM: [http://localhost:5000](http://localhost:5000)
   - Giao diện phpMyAdmin: [http://localhost:8080](http://localhost:8080)
   - Prometheus Metrics: [http://localhost:5000/metrics](http://localhost:5000/metrics)

4. **Dừng hệ thống:**
   ```bash
   docker compose down
   ```

---

### Cách 2: Chạy trực tiếp (Local Development)

Yêu cầu máy tính đã cài **Node.js (>= 20)** và dịch vụ **MySQL 8.0** đang chạy.

1. **Cài đặt thư viện dependencies:**
   ```bash
   npm install
   ```

2. **Cấu hình file môi trường `.env`:**
   Chỉnh sửa các thông số kết nối MySQL (`DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`) phù hợp với máy tính cá nhân.

3. **Chạy Migration & Khởi tạo dữ liệu mẫu:**
   ```bash
   npm run db:migrate
   ```

4. **Khởi chạy máy chủ HRM:**
   ```bash
   npm start
   # Hoặc chạy chế độ phát triển với Nodemon:
   npm run dev
   ```

---

## 📡 Danh sách API Endpoints

### 1. Xác thực & Người dùng (`/api/auth`)
- `POST /api/auth/register`: Đăng ký tài khoản mới.
- `POST /api/auth/login`: Đăng nhập & cấp phát JWT token.
- `GET  /api/auth/me`: Lấy thông tin tài khoản đang đăng nhập.

### 2. Quản lý phòng ban (`/api/departments`)
- `GET    /api/departments`: Lấy danh sách kèm số lượng nhân viên từng phòng ban.
- `GET    /api/departments/:id`: Lấy chi tiết phòng ban và danh sách nhân sự trực thuộc.
- `POST   /api/departments`: Thêm phòng ban mới *(Yêu cầu quyền Admin)*.
- `PUT    /api/departments/:id`: Cập nhật phòng ban *(Yêu cầu quyền Admin)*.
- `DELETE /api/departments/:id`: Xóa phòng ban *(Kiểm tra ràng buộc nhân viên)*.

### 3. Quản lý nhân sự (`/api/employees`)
- `GET    /api/employees`: Tìm kiếm, phân trang, lọc theo phòng ban & trạng thái.
- `GET    /api/employees/:id`: Lấy chi tiết hồ sơ nhân viên và lịch sử chấm công.
- `POST   /api/employees`: Thêm nhân viên mới *(Yêu cầu quyền Admin)*.
- `PUT    /api/employees/:id`: Cập nhật nhân viên *(Yêu cầu quyền Admin)*.
- `DELETE /api/employees/:id`: Xóa nhân viên *(Yêu cầu quyền Admin)*.

### 4. Chấm công (`/api/attendance`)
- `POST /api/attendance/check-in`: Check-in vào ca làm việc hôm nay.
- `POST /api/attendance/check-out`: Check-out tan ca hôm nay.
- `GET  /api/attendance/today`: Kiểm tra trạng thái chấm công cá nhân hôm nay.
- `GET  /api/attendance/history`: Xem lịch sử chấm công cá nhân/tất cả theo tháng & năm.
- `GET  /api/attendance/summary`: Báo cáo tổng hợp số ngày công theo tháng *(Admin)*.

### 5. Thống kê & Giám sát (`/api/stats` & `/metrics`)
- `GET /api/stats`: Thống kê tổng số nhân sự, phòng ban, điểm danh hôm nay.
- `GET /metrics`: Prometheus exporter metrics phục vụ giám sát hệ thống.
- `GET /api/health`: Healthcheck endpoint kiểm tra tính sẵn sàng của web service.

---

## 📈 Tiến độ Sprint & Kế hoạch phát triển

- [x] **Sprint 1: Xây dựng nền tảng cốt lõi & Quản lý nhân sự**
  - [x] Khởi tạo Git repository, cấu trúc thư mục, `package.json`, `.gitignore`, `README.md`.
  - [x] Cấu hình kết nối MySQL và script Migration & Auto-seed dữ liệu mẫu.
  - [x] Hoàn thiện API và Giao diện Đăng nhập, phân quyền JWT.
  - [x] Hoàn thiện API và Giao diện Quản lý phòng ban (CRUD).
  - [x] Hoàn thiện API và Giao diện Quản lý nhân viên (CRUD, Tìm kiếm, Phân trang, Xem chi tiết).
  - [x] Đóng gói Docker Compose cơ bản (Web app + MySQL + phpMyAdmin).
  - [x] **GitHub Commit 1** hoàn tất.

- [ ] **Sprint 2: Chấm công & Hạ tầng DevOps nâng cao**
  - [x] Nghiệp vụ Chấm công (Check-in/out, Lịch sử, Bảng tổng hợp tháng - đã xây dựng nền tảng).
  - [ ] Nginx Reverse Proxy (HTTPS tự ký, Security headers) - **Commit 2**.
  - [ ] Giám sát Prometheus + Grafana dashboard + cAdvisor.
  - [ ] Quản lý Log tập trung Loki + Promtail + LogQL queries - **Commit 3**.
  - [ ] Hardening hệ thống (Non-root user, Network isolation, Phân quyền DB).
  - [ ] Hoàn thiện báo cáo tổng hợp (≥ 10 trang).

---

*Tác giả: Đỗ Quang Minh*
