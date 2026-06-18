// admin/js/api.js — shared API client + auth helpers for the KRISHA PURE admin console

const API_BASE = 'https://hf7d5uklwbvj2syjjromiyrkxy0mlcqp.lambda-url.ap-southeast-2.on.aws';

const Auth = {
  TOKEN_KEY: 'kp_admin_token',
  USER_KEY:  'kp_admin_user',
  getToken() { return localStorage.getItem(this.TOKEN_KEY); },
  getUsername() { return localStorage.getItem(this.USER_KEY) || 'admin'; },
  setSession(token, username) {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, username || 'admin');
  },
  clear() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  },
  isLoggedIn() { return !!this.getToken(); },
  // Call at the top of every protected page
  guard() {
    if (!this.isLoggedIn()) window.location.href = 'login.html';
  },
};

async function req(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = Auth.getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    throw new Error('Network error — could not reach the server');
  }

  let data;
  try { data = await res.json(); }
  catch (e) { throw new Error(`Server returned an invalid response (HTTP ${res.status})`); }

  if (res.status === 401 || res.status === 403) {
    if (!location.pathname.endsWith('login.html')) {
      Auth.clear();
      window.location.href = 'login.html';
    }
    throw new Error(data.message || 'Session expired');
  }

  if (!data.success) throw new Error(data.message || 'Request failed');
  return data;
}

const qs = (params = {}) => {
  const clean = {};
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') clean[k] = v; });
  const s = new URLSearchParams(clean).toString();
  return s ? `?${s}` : '';
};

const adminApi = {
  login: (username, password) => req('POST', '/admin/login', { username, password }),

  // Dashboard / reports (Statistics)
  dashboard:          () => req('GET', '/admin/dashboard'),
  salesReport:        (params) => req('GET', `/admin/reports/sales${qs(params)}`),
  subscriptionReport: () => req('GET', '/admin/reports/subscriptions'),

  // Orders
  getOrders:    (params) => req('GET', `/admin/orders${qs(params)}`),
  getOrder:     (id) => req('GET', `/admin/orders/${id}`),
  updateStatus: (id, status) => req('PUT', `/admin/orders/${id}/status`, { status }),

  // Customers (families)
  getCustomers:   (params) => req('GET', `/admin/customers${qs(params)}`),
  getCustomer:    (id) => req('GET', `/admin/customers/${id}`),
  updateCustomer: (id, body) => req('PUT', `/admin/customers/${id}`, body),
  addMember:      (id, body) => req('POST', `/admin/customers/${id}/members`, body),
  updateMember:   (id, memberId, body) => req('PUT', `/admin/customers/${id}/members/${memberId}`, body),
  deleteMember:   (id, memberId) => req('DELETE', `/admin/customers/${id}/members/${memberId}`),

  // Products (Ingredients) + Images
  getIngredients:        (params) => req('GET', `/admin/ingredients${qs(params)}`),
  createIngredient:      (body) => req('POST', '/admin/ingredients', body),
  updateIngredient:      (id, body) => req('PUT', `/admin/ingredients/${id}`, body),
  deleteIngredient:      (id) => req('DELETE', `/admin/ingredients/${id}`),
  uploadIngredientImage: (id, imageBase64, mimeType) => req('PUT', `/admin/ingredients/${id}/image`, { imageBase64, mimeType }),
  deleteIngredientImage: (id) => req('DELETE', `/admin/ingredients/${id}/image`),
  ingredientImageUrl:    (id) => `${API_BASE}/admin/ingredients/${id}/image`,

  // Subscription Packages
  getPlans:   () => req('GET', '/admin/subscription-plans'),
  createPlan: (body) => req('POST', '/admin/subscription-plans', body),
  updatePlan: (id, body) => req('PUT', `/admin/subscription-plans/${id}`, body),
  deletePlan: (id) => req('DELETE', `/admin/subscription-plans/${id}`),

  // Wellness Goals
  getGoals:   () => req('GET', '/admin/goals'),
  createGoal: (body) => req('POST', '/admin/goals', body),
  updateGoal: (id, body) => req('PUT', `/admin/goals/${id}`, body),
  deleteGoal: (id) => req('DELETE', `/admin/goals/${id}`),

  // Coupons
  getCoupons:   () => req('GET', '/admin/coupons'),
  createCoupon: (body) => req('POST', '/admin/coupons', body),
  updateCoupon: (id, body) => req('PUT', `/admin/coupons/${id}`, body),
  deleteCoupon: (id) => req('DELETE', `/admin/coupons/${id}`),

  // Curated Baskets
  getBaskets:   () => req('GET', '/admin/baskets'),
  createBasket: (body) => req('POST', '/admin/baskets', body),
  updateBasket: (id, body) => req('PUT', `/admin/baskets/${id}`, body),
  deleteBasket: (id) => req('DELETE', `/admin/baskets/${id}`),

  // Apartments
  getApartments:   () => req('GET', '/admin/apartments'),
  createApartment: (body) => req('POST', '/admin/apartments', body),
  updateApartment: (id, body) => req('PUT', `/admin/apartments/${id}`, body),
  deleteApartment: (id) => req('DELETE', `/admin/apartments/${id}`),
};

function showToast(msg, type = 'default') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

function fmtMoney(n) {
  if (n === undefined || n === null) return '₹0';
  return '₹' + Number(n).toLocaleString('en-IN');
}

function fmtDate(d, opts) {
  if (!d) return '–';
  return new Date(d).toLocaleDateString('en-IN', opts || { day: 'numeric', month: 'short', year: 'numeric' });
}

function escapeHtml(str) {
  if (str === undefined || str === null) return '';
  return String(str).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
}

// Resize + compress an image File client-side before upload, so we stay well
// under the server's 1.5MB decoded cap. Returns { base64, mimeType }.
function compressImageFile(file, maxDim = 800, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.onload = () => {
      img.onerror = () => reject(new Error('Could not load image'));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) { height = Math.round(height * (maxDim / width)); width = maxDim; }
          else { width = Math.round(width * (maxDim / height)); height = maxDim; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve({ base64: dataUrl.split(',')[1], mimeType: 'image/jpeg' });
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
