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
    if (!this.isLoggedIn()) window.location.href = 'index.html';
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
    if (!location.pathname.endsWith('index.html')) {
      Auth.clear();
      window.location.href = 'index.html';
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

  // Products (Ingredients) + Images (S3 presign flow)
  getIngredients:           (params) => req('GET', `/admin/ingredients${qs(params)}`),
  createIngredient:         (body)   => req('POST', '/admin/ingredients', body),
  updateIngredient:         (id, body) => req('PUT', `/admin/ingredients/${id}`, body),
  deleteIngredient:         (id)     => req('DELETE', `/admin/ingredients/${id}`),
  hardDeleteIngredient:     (id)     => req('DELETE', `/admin/ingredients/${id}/hard`),
  // Step 1 — get a signed S3 PUT URL
  presignIngredientImage:   (id, mimeType) => req('GET', `/admin/ingredients/${id}/image/presign${qs({ mimeType })}`),
  // Step 3 — tell backend the upload is done so it saves imageKey+imageUrl to MongoDB
  confirmIngredientImage:   (id, imageKey, imageUrl) => req('POST', `/admin/ingredients/${id}/image/confirm`, { imageKey, imageUrl }),
  // Delete from S3 + clear MongoDB
  deleteIngredientImage:    (id) => req('DELETE', `/admin/ingredients/${id}/image`),

  // Subscription Packages
  getPlans:         () => req('GET', '/admin/subscription-plans'),
  createPlan:       (body) => req('POST', '/admin/subscription-plans', body),
  updatePlan:       (id, body) => req('PUT', `/admin/subscription-plans/${id}`, body),
  deletePlan:       (id) => req('DELETE', `/admin/subscription-plans/${id}`),
  hardDeletePlan:   (id) => req('DELETE', `/admin/subscription-plans/${id}/hard`),

  // Wellness Goals
  getGoals:         () => req('GET', '/admin/goals'),
  createGoal:       (body) => req('POST', '/admin/goals', body),
  updateGoal:       (id, body) => req('PUT', `/admin/goals/${id}`, body),
  deleteGoal:       (id) => req('DELETE', `/admin/goals/${id}`),
  hardDeleteGoal:   (id) => req('DELETE', `/admin/goals/${id}/hard`),

  // Coupons
  getCoupons:       () => req('GET', '/admin/coupons'),
  createCoupon:     (body) => req('POST', '/admin/coupons', body),
  updateCoupon:     (id, body) => req('PUT', `/admin/coupons/${id}`, body),
  deleteCoupon:     (id) => req('DELETE', `/admin/coupons/${id}`),
  hardDeleteCoupon: (id) => req('DELETE', `/admin/coupons/${id}/hard`),

  // Curated Baskets
  getBaskets:         () => req('GET', '/admin/baskets'),
  createBasket:       (body) => req('POST', '/admin/baskets', body),
  updateBasket:       (id, body) => req('PUT', `/admin/baskets/${id}`, body),
  deleteBasket:       (id) => req('DELETE', `/admin/baskets/${id}`),
  hardDeleteBasket:   (id) => req('DELETE', `/admin/baskets/${id}/hard`),

  // Apartments
  getApartments:       () => req('GET', '/admin/apartments'),
  createApartment:     (body) => req('POST', '/admin/apartments', body),
  updateApartment:     (id, body) => req('PUT', `/admin/apartments/${id}`, body),
  deleteApartment:     (id) => req('DELETE', `/admin/apartments/${id}`),
  hardDeleteApartment: (id) => req('DELETE', `/admin/apartments/${id}/hard`),
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

// Resize + compress an image client-side before upload.
// Returns a Blob so we can PUT it directly to S3.
// maxDim=1200 keeps good quality; S3 has no size concern like Lambda did.
function compressImageToBlob(file, maxDim = 1200, quality = 0.88) {
  return new Promise((resolve, reject) => {
    const img    = new Image();
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
        canvas.toBlob(blob => {
          if (!blob) { reject(new Error('Image compression failed')); return; }
          resolve({ blob, mimeType: 'image/jpeg' });
        }, 'image/jpeg', quality);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

// Full S3 presign upload flow:
//   1. Get signed PUT URL from Lambda
//   2. PUT the blob directly to S3 (no auth header — S3 uses the signed URL)
//   3. Call confirm so Lambda saves imageKey + imageUrl to MongoDB
// Returns { imageUrl } on success.
async function uploadIngredientImageToS3(ingredientId, file) {
  // Step 1 — compress
  const { blob, mimeType } = await compressImageToBlob(file);

  // Step 2 — get presigned URL from Lambda
  const { signedUrl, imageKey, imageUrl } = await adminApi.presignIngredientImage(ingredientId, mimeType);

  // Step 3 — PUT directly to S3 (no Authorization header)
  const s3Res = await fetch(signedUrl, {
    method:  'PUT',
    headers: { 'Content-Type': mimeType },
    body:    blob,
  });
  if (!s3Res.ok) {
    throw new Error(`S3 upload failed (HTTP ${s3Res.status}) — check bucket CORS and policy`);
  }

  // Step 4 — confirm to Lambda so MongoDB is updated
  await adminApi.confirmIngredientImage(ingredientId, imageKey, imageUrl);

  return { imageUrl };
}
