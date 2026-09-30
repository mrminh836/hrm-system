const express = require('express');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const client = require('prom-client');
require('dotenv').config();

const migrateAndSeed = require('./db/migrate');
const authRoutes = require('./routes/auth.routes');
const departmentRoutes = require('./routes/department.routes');
const employeeRoutes = require('./routes/employee.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const statsRoutes = require('./routes/stats.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Prometheus metrics setup (ready for Sprint 2 US 17.0)
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ register: client.register });

const httpRequestCounter = new client.Counter({
  name: 'hrm_http_requests_total',
  help: 'Total number of HTTP requests handled by HRM backend',
  labelNames: ['method', 'route', 'status_code'],
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Metrics collection middleware
app.use((req, res, next) => {
  res.on('finish', () => {
    const route = req.route ? req.route.path : req.path;
    httpRequestCounter.inc({
      method: req.method,
      route,
      status_code: res.statusCode,
    });
  });
  next();
});

// Serve Prometheus metrics
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/stats', statsRoutes);

// Serve Static Frontend Assets
const frontendPath = path.join(__dirname, '../../frontend');
app.use(express.static(frontendPath));

// Fallback to index.html for SPA-like navigation
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path === '/metrics') {
    return next();
  }
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Đã xảy ra lỗi máy chủ nội bộ.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start Server and optionally run migration if DB is available
app.listen(PORT, async () => {
  console.log(`=======================================================`);
  console.log(`🚀 Hệ thống Quản lý Nhân sự (HRM System) đang chạy`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`📊 Metrics: http://localhost:${PORT}/metrics`);
  console.log(`🏥 Health: http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);

  try {
    await migrateAndSeed();
  } catch (err) {
    console.warn(`[Startup Warning] Database migration postponed: ${err.message}. (Sẽ chạy lại khi Docker DB sẵn sàng)`);
  }
});
