/**
 * HRM SYSTEM API CLIENT & UTILITIES
 */

const API_BASE = '/api';

// Toast Notification
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Token & User helpers
function getToken() {
  return localStorage.getItem('hrm_token');
}

function setAuth(token, user) {
  localStorage.setItem('hrm_token', token);
  localStorage.setItem('hrm_user', JSON.stringify(user));
}

function getCurrentUser() {
  try {
    const raw = localStorage.getItem('hrm_user');
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

function clearAuth() {
  localStorage.removeItem('hrm_token');
  localStorage.removeItem('hrm_user');
}

function requireAuth() {
  const token = getToken();
  if (!token) {
    window.location.href = '/pages/login.html';
    return false;
  }
  return true;
}

// Core Fetch Wrapper
async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => ({}));

    if (res.status === 401) {
      clearAuth();
      showToast('Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.', 'error');
      setTimeout(() => {
        window.location.href = '/pages/login.html';
      }, 1000);
      throw new Error('Unauthorized');
    }

    if (!res.ok) {
      throw new Error(data.message || 'Yêu cầu không thành công.');
    }

    return data;
  } catch (error) {
    if (error.message !== 'Unauthorized') {
      showToast(error.message, 'error');
    }
    throw error;
  }
}

const api = {
  get: (url) => apiRequest(url, { method: 'GET' }),
  post: (url, body) => apiRequest(url, { method: 'POST', body: JSON.stringify(body) }),
  put: (url, body) => apiRequest(url, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (url) => apiRequest(url, { method: 'DELETE' }),
};

// Common Formatter Helpers
function formatCurrency(amount) {
  if (!amount && amount !== 0) return '0 đ';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('vi-VN');
}
