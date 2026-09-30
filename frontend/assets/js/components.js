/**
 * HRM Pro Enterprise - Stitch Component Shell
 * Exact implementation of Stitch "Executive Precision" Design System
 */

function renderSidebar(activeKey = 'dashboard', breadcrumbTitle = 'Hệ thống Quản trị Doanh nghiệp') {
  const container = document.getElementById('sidebar-container');
  if (!container) return;

  const user = getCurrentUser() || { full_name: 'Trần Quản Trị', role: 'admin' };
  const initials = user.full_name
    ? user.full_name.split(' ').map(n => n[0]).slice(-2).join('').toUpperCase()
    : 'AD';
  const roleText = user.role === 'admin' ? 'Quản trị viên' : 'Nhân viên';

  const menu = [
    { key: 'dashboard', label: 'Bảng điều khiển', icon: 'dashboard', url: '/pages/dashboard.html' },
    { key: 'employees', label: 'Nhân viên', icon: 'badge', url: '/pages/employees.html' },
    { key: 'departments', label: 'Phòng ban', icon: 'apartment', url: '/pages/departments.html' },
    { key: 'attendance', label: 'Chấm công', icon: 'schedule', url: '/pages/attendance.html' }
  ];

  container.innerHTML = `
    <!-- STITCH SIDEBAR -->
    <aside class="fixed left-0 top-0 h-full w-64 bg-surface-container-lowest shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex flex-col justify-between select-none border-r border-surface-container">
      <div class="flex flex-col">
        <!-- Logo Header -->
        <a href="/pages/dashboard.html" class="h-16 px-space-lg flex items-center gap-space-sm border-b border-surface-container text-decoration-none">
          <div class="w-9 h-9 rounded-lg bg-primary-container text-on-primary flex items-center justify-center font-bold text-base shadow-sm">
            <span class="material-symbols-outlined text-[22px]">corporate_fare</span>
          </div>
          <div class="flex flex-col">
            <span class="font-headline-sm text-headline-sm text-primary tracking-tight font-bold leading-tight">HRM Pro</span>
            <span class="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-[10px]">Enterprise</span>
          </div>
        </a>

        <!-- Main Navigation Links -->
        <div class="px-space-md py-space-sm">
          <p class="px-space-sm py-space-xs font-label-sm text-label-sm text-outline uppercase tracking-wider text-[11px] font-semibold">Phân hệ chính</p>
          <nav class="flex flex-col gap-1 mt-space-xs">
            ${menu.map(item => {
              const isActive = (activeKey === item.key);
              if (isActive) {
                return `
                  <a href="${item.url}" aria-current="page" class="flex items-center gap-space-sm px-space-md py-2.5 rounded-lg transition-colors bg-primary-container text-on-primary font-label-lg shadow-sm">
                    <span class="material-symbols-outlined text-[20px]">${item.icon}</span>
                    <span class="font-medium">${item.label}</span>
                  </a>
                `;
              }
              return `
                <a href="${item.url}" class="flex items-center gap-space-sm px-space-md py-2.5 rounded-lg font-label-lg text-label-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors">
                  <span class="material-symbols-outlined text-[20px] text-outline">${item.icon}</span>
                  <span>${item.label}</span>
                </a>
              `;
            }).join('')}
          </nav>
        </div>
      </div>

      <!-- Config & Logout Navigation -->
      <div class="p-space-md border-t border-surface-container flex flex-col gap-1">
        <p class="px-space-sm py-space-xs font-label-sm text-label-sm text-outline uppercase tracking-wider text-[11px] font-semibold">Cấu hình & Tài khoản</p>
        <nav class="flex flex-col gap-1">
          <button id="btn-stitch-logout" class="w-full flex items-center gap-space-sm px-space-md py-2.5 rounded-lg font-label-lg text-label-lg text-error hover:bg-error-container hover:text-on-error-container transition-colors text-left">
            <span class="material-symbols-outlined text-[20px]">logout</span>
            <span>Đăng xuất</span>
          </button>
        </nav>
      </div>
    </aside>

    <!-- STITCH TOP HEADER -->
    <header class="fixed top-0 left-64 right-0 h-16 bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-surface-container z-40 px-space-xl flex items-center justify-between">
      <div class="flex items-center gap-space-sm">
        <div class="w-7 h-7 rounded bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
          <span class="material-symbols-outlined text-[16px]">domain</span>
        </div>
        <nav class="flex items-center gap-space-xs font-label-md text-label-md text-on-surface-variant">
          <span class="text-on-surface font-label-md font-bold">HRM Pro</span>
          <span class="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
          <span class="text-outline font-medium">${breadcrumbTitle}</span>
        </nav>
      </div>

      <div class="flex items-center gap-space-lg">
        <div class="relative flex items-center">
          <span class="material-symbols-outlined absolute left-3 text-outline text-[18px]">search</span>
          <input class="w-72 h-10 pl-9 pr-14 bg-surface-container-low rounded-lg border-0 font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Tìm kiếm hồ sơ, phòng ban..." type="text"/>
          <div class="absolute right-2 px-1.5 py-0.5 rounded bg-surface-container-highest font-label-sm text-label-sm text-on-surface-variant font-mono">⌘K</div>
        </div>

        <div class="flex items-center gap-space-md">
          <div class="inline-flex items-center px-2.5 py-1 rounded-full bg-secondary-container text-on-secondary-fixed-variant font-label-sm text-label-sm gap-1.5 font-medium">
            <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            <span>Vai trò: ${roleText}</span>
          </div>

          <button class="relative p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors" title="Thông báo hệ thống">
            <span class="material-symbols-outlined text-[22px]">notifications</span>
            <span class="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error ring-2 ring-surface-container-lowest"></span>
          </button>

          <div class="h-6 w-px bg-surface-container"></div>

          <div class="flex items-center gap-space-sm cursor-pointer" title="Hồ sơ tài khoản">
            <div class="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-xs shadow-sm">
              ${initials}
            </div>
            <div class="flex flex-col text-left">
              <span class="font-label-md text-label-md text-on-surface leading-tight font-bold">${user.full_name}</span>
              <span class="font-body-sm text-body-sm text-on-surface-variant leading-tight text-xs">${user.role === 'admin' ? 'Admin System' : 'Nhân sự'}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  `;

  document.getElementById('btn-stitch-logout')?.addEventListener('click', () => {
    if (confirm('Bạn có chắc chắn muốn đăng xuất khỏi hệ thống HRM Pro Enterprise?')) {
      clearAuth();
      showToast('Đã đăng xuất thành công.');
      setTimeout(() => {
        window.location.href = '/pages/login.html';
      }, 400);
    }
  });
}
