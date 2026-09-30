/**
 * HRM Shared UI Components (Sidebar, Header, Layout, Logout)
 */

function renderSidebar(activeKey = 'dashboard') {
  const sidebarContainer = document.getElementById('sidebar-container');
  if (!sidebarContainer) return;

  const user = getCurrentUser() || { full_name: 'Quản trị viên', role: 'admin' };
  const initials = user.full_name
    ? user.full_name.split(' ').map(n => n[0]).slice(-2).join('').toUpperCase()
    : 'AD';

  const menuItems = [
    { key: 'dashboard', label: 'Bảng điều khiển', icon: '📊', url: '/pages/dashboard.html' },
    { key: 'employees', label: 'Quản lý nhân viên', icon: '👥', url: '/pages/employees.html' },
    { key: 'departments', label: 'Quản lý phòng ban', icon: '🏢', url: '/pages/departments.html' },
    { key: 'attendance', label: 'Chấm công', icon: '⏱️', url: '/pages/attendance.html' },
  ];

  sidebarContainer.innerHTML = `
    <aside class="app-sidebar">
      <div class="sidebar-header">
        <div class="brand-icon">⚡</div>
        <div class="brand-info">
          <h1>HRM SYSTEM</h1>
          <p>Quản lý nhân sự</p>
        </div>
      </div>

      <nav class="sidebar-menu">
        <div class="menu-label">Menu chức năng</div>
        ${menuItems.map(item => `
          <a href="${item.url}" class="menu-item ${activeKey === item.key ? 'active' : ''}">
            <i>${item.icon}</i>
            <span>${item.label}</span>
          </a>
        `).join('')}
      </nav>

      <div class="sidebar-footer">
        <div class="user-profile-badge">
          <div class="user-avatar">${initials}</div>
          <div class="user-meta">
            <div class="user-name" title="${user.full_name}">${user.full_name}</div>
            <div class="user-role">${user.role === 'admin' ? 'Quản trị viên' : 'Nhân viên'}</div>
          </div>
          <button class="btn-logout" id="logout-btn" title="Đăng xuất">⏻</button>
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
      }, 500);
    }
  });
}
