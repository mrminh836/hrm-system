# ⚡ Hệ thống Quản lý Nhân sự & Chấm công (HRM System)

> **Hệ thống Quản lý Nhân sự (HRM System)** đơn giản, hiệu quả và hiện đại, giúp doanh nghiệp quản lý thông tin nhân viên, cơ cấu tổ chức phòng ban và chấm công một cách chính xác, minh bạch — đóng gói triển khai toàn bộ bằng **Docker Compose** với hạ tầng Reverse Proxy HTTPS, hệ thống giám sát Prometheus + Grafana và quản lý log tập trung Loki + Promtail hoàn chỉnh.

---

## 📋 Mục lục
1. [Giới thiệu & Tính năng chính](#-giới-thiệu--tính-năng-chính)
2. [Cổng dịch vụ & URL Truy cập](#-cổng-dịch-vụ--url-truy-cập)
3. [Tài khoản mặc định](#-tài-khoản-mặc-định)
4. [Ngăn xếp công nghệ (Tech Stack)](#-ngăn-xếp-công-nghệ-tech-stack)
5. [Cấu trúc thư mục dự án](#-cấu-trúc-thư-mục-dự-án)
6. [Hướng dẫn cài đặt & Khởi chạy](#-hướng-dẫn-cài-đặt--khởi-chạy)
7. [Hạ tầng Giám sát & Quản lý Log (Sprint 2)](#-hạ-tầng-giám-sát--quản-lý-log-sprint-2)
8. [Các biện pháp Hardening Bảo mật](#-các-biện-pháp-hardening-bảo-mật)
9. [Lịch sử Git Commits](#-lịch-sử-git-commits)
10. [Tài liệu Báo cáo Dự án](#-tài-liệu-báo-cáo-dự-án)

---

## 🌐 Cổng dịch vụ & URL Truy cập

| Dịch vụ | Địa chỉ truy cập | Giao thức | Ghi chú |
| :--- | :--- | :---: | :--- |
| **HRM Web App (Chính thức)** | **[https://localhost](https://localhost)** | HTTPS | Nginx Reverse Proxy (SSL tự ký, Security Headers) |
| **HTTP Redirect** | `http://localhost` | HTTP | Tự động chuyển hướng (301) sang `https://localhost` |
| **phpMyAdmin** | **[https://localhost/phpmyadmin/](https://localhost/phpmyadmin/)** | HTTPS | Quản trị GUI MySQL qua Nginx Proxy |
| **Grafana Dashboard** | **[http://localhost:3000](http://localhost:3000)** | HTTP | Bảng điều khiển giám sát hệ thống (Provisioned) |
| **Prometheus Web UI** | **[http://localhost:9090](http://localhost:9090)** | HTTP | Thu thập số liệu metrics thời gian thực |
| **cAdvisor Metrics** | **[http://localhost:8081](http://localhost:8081)** | HTTP | Giám sát thông số phần cứng các container |
| **Loki Log Engine** | **[http://localhost:3100](http://localhost:3100)** | HTTP | Quản lý log tập trung, truy vấn LogQL |
| **Node.js Metrics Trực tiếp**| **[http://localhost:5000/metrics](http://localhost:5000/metrics)** | HTTP | Exporter của Express web service |
| **MySQL Server** | Cổng host: `3307` (Container: `3306`) | TCP | Kết nối từ DBeaver / Workbench |

---

## 🔑 Tài khoản mặc định

| Hệ thống | Tài khoản | Mật khẩu | Quyền hạn / Ghi chú |
| :--- | :--- | :--- | :--- |
| **HRM Web App** | `admin@hrm.local` | `Admin@123` | Quản trị viên cao nhất (Admin) |
| **Grafana** | `admin` | `admin` | Quản trị giám sát Dashboard |
| **phpMyAdmin** | `hrm_user` | `hrm_secure_password_2026` | Quản trị database `hrm_db` |
| **MySQL Root** | `root` | `hrm_root_secure_2026` | Quản trị cấp cao máy chủ MySQL |

---

## 🌟 Giới thiệu & Tính năng chính

### 👥 1. Quản lý nhân sự (Employee Management)
- Thêm nhân viên mới với đầy đủ thông tin: Mã NV, họ tên, email, SĐT, ngày sinh, giới tính, địa chỉ, vị trí, phòng ban, mức lương.
- Danh sách nhân viên phân trang, tìm kiếm tức thì theo tên/email/mã NV/SĐT, lọc theo phòng ban và trạng thái (Đang làm việc, Thử việc, Tạm nghỉ, Đã nghỉ việc).
- Chỉnh sửa thông tin nhân viên, xóa hồ sơ với xác nhận an toàn.
- Xem chi tiết hồ sơ cá nhân, đãi ngộ và thống kê / lịch sử chấm công chi tiết.

### 🏢 2. Quản lý phòng ban (Department Management)
- CRUD phòng ban (Tên, mã phòng ban, trưởng phòng, mô tả chức năng).
- Thống kê tự động số lượng nhân viên thuộc từng phòng ban.
- Cơ chế bảo vệ toàn vẹn dữ liệu: Không cho phép xóa phòng ban khi vẫn còn nhân sự trực thuộc.

### ⏱️ 3. Chấm công & Điểm danh (Attendance)
- Check-in (Vào ca) & Check-out (Tan ca) hàng ngày theo thời gian thực.
- Tự động nhận diện trạng thái Đúng giờ / Đi muộn dựa theo quy định ca làm việc (sau 08:30 là đi muộn).
- Thống kê số ngày làm, đúng giờ, đi muộn, về sớm theo từng nhân viên.
- Xem lịch sử chấm công cá nhân theo tháng/năm.
- Bảng tổng hợp công nhân viên toàn công ty dành cho Quản lý.

### 🔐 4. Xác thực & Phân quyền (Authentication & Authorization)
- Đăng nhập bảo mật bằng JWT (JSON Web Token), mã hóa mật khẩu bằng `bcryptjs`.
- Phân quyền theo vai trò: `Admin` (Quản trị viên) và `Employee` (Nhân viên).

---

## 🛠 Ngăn xếp công nghệ (Tech Stack)

| Thành phần | Công nghệ sử dụng |
| :--- | :--- |
| **Backend** | Node.js (v22-alpine), Express.js |
| **Database** | MySQL 8.0 (InnoDB, utf8mb4) |
| **DB GUI Tool** | phpMyAdmin |
| **Frontend** | Vanilla HTML5, Modern CSS3 (Variables, Flexbox/Grid, Glassmorphism), Vanilla JavaScript ES6+ |
| **Authentication** | JWT (jsonwebtoken), bcryptjs |
| **Containerization**| Docker, Docker Compose (10 Containers) |
| **Reverse Proxy** | Nginx Alpine (SSL/TLS tự ký, Security Headers) |
| **Monitoring** | Prometheus v2.51, Grafana 10.4, MySQL Exporter, cAdvisor |
| **Logging** | Grafana Loki 2.9, Promtail 2.9, LogQL |

---

## 📁 Cấu trúc thư mục dự án

```text
Hệ thống Quản lý Nhân sự (HRM)/
├── backend/
│   └── src/
│       ├── config/
│       │   └── db.js                  # Cấu hình Pool kết nối MySQL
│       ├── controllers/
│       │   ├── attendance.controller.js  # Chấm công & thống kê ngày công
│       │   ├── auth.controller.js        # Đăng ký, đăng nhập JWT
│       │   ├── department.controller.js  # CRUD phòng ban
│       │   ├── employee.controller.js    # CRUD nhân viên & tìm kiếm
│       │   └── stats.controller.js       # Thống kê tổng quan Dashboard
│       ├── db/
│       │   ├── schema.sql             # Cấu trúc bảng MySQL
│       │   ├── hardening.sql          # Thu hồi quyền & cấp quyền tối thiểu
│       │   └── migrate.js             # Migration & Seed dữ liệu tự động
│       ├── middleware/
│       │   └── auth.js                # Middleware JWT & role Admin
│       ├── routes/                    # RESTful API routes
│       └── server.js                  # Entry point Express app & metrics
├── frontend/
│   ├── assets/
│   │   ├── css/main.css               # Design System toàn diện cho HRM
│   │   └── js/
│   │       ├── api.js                 # API Client, Toast, Auth Token
│   │       └── components.js          # Sidebar, Navbar & Logout
│   ├── pages/                         # Các trang giao diện chức năng
│   └── index.html                     # Điều hướng ứng dụng
├── nginx/
│   ├── conf.d/hrm.conf                # Cấu hình Reverse Proxy, HTTPS, Security Headers
│   └── ssl/                           # Cặp khóa và chứng chỉ SSL x509
├── monitoring/
│   ├── prometheus/prometheus.yml      # Cấu hình Scrape 4 targets
│   ├── grafana/
│   │   ├── provisioning/              # Tự động nạp Datasource và Dashboard
│   │   └── dashboards/                # Bảng điều khiển giám sát JSON
│   ├── loki/loki-config.yml           # Cấu hình Loki Log Engine
│   ├── promtail/promtail-config.yml   # Cấu hình Promtail Log Shipper
│   └── mysql-exporter/.my.cnf         # Cấu hình trích xuất metrics MySQL
├── docs/
│   ├── Product_Backlog_HRM_System_v2.xlsx   # Backlog Scrum 20 User Stories
│   ├── logql_queries.md                     # Tài liệu hướng dẫn 4 câu truy vấn LogQL
│   └── BAO_CAO_TONG_HOP_HRM_DEVOPS.md       # Báo cáo tổng hợp dự án ≥ 10 trang
├── docker-compose.yml                 # Khởi chạy 10 containers với 3 mạng biệt lập
├── Dockerfile                         # Image Node.js tối ưu với non-root user
├── .env.example                       # Biến môi trường mẫu
└── package.json                       # Dependencies & scripts
```

---

## 🚀 Hướng dẫn cài đặt & Khởi chạy

### Khởi chạy toàn bộ hệ thống bằng Docker Compose

Yêu cầu máy tính đã cài đặt **Docker Desktop** (đang chạy).

1. **Khởi chạy toàn bộ 10 container:**
   ```bash
   docker compose up -d
   ```

2. **Kiểm tra trạng thái các container:**
   ```bash
   docker compose ps
   ```

3. **Mở trình duyệt truy cập:**
   - Ứng dụng HRM (Bảo mật HTTPS): **[https://localhost](https://localhost)**
   - Quản trị cơ sở dữ liệu: **[https://localhost/phpmyadmin/](https://localhost/phpmyadmin/)**
   - Dashboard Giám sát Grafana: **[http://localhost:3000](http://localhost:3000)** (User: `admin` / Pass: `admin`)
   - Bảng Prometheus: **[http://localhost:9090](http://localhost:9090)**

4. **Dừng toàn bộ hệ thống:**
   ```bash
   docker compose down
   ```

---

## 📊 Hạ tầng Giám sát & Quản lý Log (Sprint 2)

### 1. Prometheus & Grafana
- **Auto-provisioning:** Grafana tự động kết nối nguồn dữ liệu Prometheus và hiển thị bảng điều khiển `HRM System - Production Overview` ngay sau khi chạy.
- **Biểu đồ giám sát:**
  - Tổng số lượng HTTP request và tần suất gọi API (req/s).
  - Dung lượng RAM và tải CPU của tiến trình Node.js.
  - Số lượng kết nối active, uptime và số lượng câu truy vấn (qps) của MySQL.
  - Tải tài nguyên phần cứng của từng container qua cAdvisor.

### 2. Loki, Promtail & 4 Câu truy vấn LogQL
Truy cập **Grafana > Explore > Loki Data Source** và sử dụng các câu truy vấn sau:

1. **Lọc log lỗi hệ thống (Error Logs):**
   ```logql
   {container="hrm-app"} |= "error" or {container="hrm-app"} |= "Error" or {container="hrm-app"} |= "500"
   ```
2. **Theo dõi log gọi API thời gian thực (Request Logs):**
   ```logql
   {container="hrm-app"} |~ "(GET|POST|PUT|DELETE) /api"
   ```
3. **Giám sát log cơ sở dữ liệu MySQL (DB Logs):**
   ```logql
   {container="hrm-mysql"} |= "ready for connections" or {container="hrm-mysql"} |= "[Warning]" or {container="hrm-mysql"} |= "[ERROR]"
   ```
4. **Kiểm toán đăng nhập bảo mật (Authentication Logs):**
   ```logql
   {container="hrm-app"} |= "/api/auth"
   ```

*Xem chi tiết hướng dẫn tại [docs/logql_queries.md](docs/logql_queries.md).*

---

## 🛡️ Các biện pháp Hardening Bảo mật

1. **Chạy container với Non-Root User:** Dockerfile sử dụng chỉ thị `USER node`, không chạy dưới quyền root.
2. **Phân tách mạng (Network Isolation):** Tách bạch 3 mạng `hrm-frontend-net`, `hrm-backend-net`, `hrm-monitoring-net`.
3. **Đặc quyền cơ sở dữ liệu tối thiểu:** Áp dụng [hardening.sql](backend/src/db/hardening.sql), chỉ cấp `SELECT, INSERT, UPDATE, DELETE` cho user ứng dụng `hrm_user`.
4. **Bộ tiêu đề Security Headers:** Nginx triển khai `Strict-Transport-Security` (HSTS), `X-Frame-Options` (Clickjacking), `X-Content-Type-Options` (MIME Sniffing), `X-XSS-Protection`, `Referrer-Policy`, `Content-Security-Policy`.

---

## 📌 Lịch sử Git Commits

Toàn bộ tiến độ phát triển được lưu lại với 3 mốc commit chính:
- **Commit 1 (`346da77`):** `feat(sprint-1): khoi tao du an HRM, backend Express MySQL, frontend HTML/CSS/JS, docker-compose va README`
- **Commit 2 (`eaadc89`):** `feat(sprint-2): cau hinh Nginx reverse proxy, HTTPS tu ky, security headers va thong ke cham cong`
- **Commit 3 (`55402c5`):** `feat(sprint-2): cau hinh Prometheus, Grafana dashboard, Loki, Promtail, MySQL exporter va LogQL queries`

---

## 📄 Tài liệu Báo cáo Dự án
Xem toàn bộ báo cáo phân tích kiến trúc, thiết kế cơ sở dữ liệu, quy trình DevOps và đánh giá nghiệm thu chi tiết (≥ 10 trang) tại:
👉 **[Báo cáo tổng hợp dự án HRM DevOps (docs/BAO_CAO_TONG_HOP_HRM_DEVOPS.md)](docs/BAO_CAO_TONG_HOP_HRM_DEVOPS.md)**

---

*Tác giả: Đỗ Quang Minh*
