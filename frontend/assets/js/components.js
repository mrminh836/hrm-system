/**
 * HRM Modern SaaS UI Components (Sidebar, Topbar, Layout, Navigation)
 * Professional vector icons and accessible structure
 */

function renderSidebar(activeKey = 'dashboard') {
  const sidebarContainer = document.getElementById('sidebar-container');
  if (!sidebarContainer) return;

  const user = getCurrentUser() || { full_name: 'Quản trị viên', role: 'admin' };
  const initials = user.full_name
    ? user.full_name.split(' ').map(n => n[0]).slice(-2).join('').toUpperCase()
    : 'AD';

  const ic = window.icons || {};

  const menuItems = [
    { section: 'TỔNG QUAN' },
    { key: 'dashboard', label: 'Bảng điều khiển', icon: ic.dashboard || '📊', url: '/pages/dashboard.html' },
    { section: 'QUẢN TRỊ NHÂN SỰ' },
    { key: 'employees', label: 'Hồ sơ nhân viên', icon: ic.users || '👥', url: '/pages/employees.html' },
    { key: 'departments', label: 'Cơ cấu phòng ban', icon: ic.building || '🏢', url: '/pages/departments.html' },
    { section: 'VẬN HÀNH & BÁO CÁO' },
    { key: 'attendance', label: 'Chấm công & Bảng công', icon: ic.clock || '⏱️', url: '/pages/attendance.html' },
  ];

  sidebarContainer.innerHTML = `
    <aside class="app-sidebar">
      <div class="sidebar-brand">
        <div class="brand-symbol">
          ${ic.zap || '⚡'}
        </div>
        <div class="brand-text">
          <h1>HRM Enterprise</h1>
          <span>Human Resources</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        ${menuItems.map(item => {
          if (item.section) {
            return `<div class="nav-section-title">${item.section}</div>`;
          }
          const isActive = (activeKey === item.key);
          return `
            <a href="${item.url}" class="nav-link ${isActive ? 'active' : ''}">
              ${item.icon}
              <span>${item.label}</span>
            </a>
          `;
        }).join('')}
      </nav>

      <div class="sidebar-user">
        <div class="user-card">
          <div class="user-avatar-circle">
            ${initials}
            <div class="user-status-dot"></div>
          </div>
          <div class="user-info">
            <div class="user-name-text" title="${user.full_name}">${user.full_name}</div>
            <div class="user-role-text">
              <span>●</span>
              <span>${user.role === 'admin' ? 'Quản trị viên' : 'Nhân viên'}</span>
            </div>
          </div>
          <button class="btn-logout-icon" id="logout-btn" title="Đăng xuất khỏi hệ thống">
            ${ic.logout || '⏻'}
          </button>
        </div>
      </div>
    </aside>
  `;

  document.getElementById('logout-btn')?.addEventListener('click', () => {
    if (confirm('Bạn có chắc chắn muốn đăng xuất không?')) {
      clearAuth();
      showToast('Đã đăng xuất thành công.');
      setTimeout(() => {
        window.location.href = '/pages/login.html';
      }, 400);
    }
  });
}
