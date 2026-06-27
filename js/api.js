// admin/js/api.js — shared API client + auth helpers for the KRISHA PURE admin console

const API_BASE = 'https://hf7d5uklwbvj2syjjromiyrkxy0mlcqp.lambda-url.ap-southeast-2.on.aws';

// Role definitions — which sidebar menus each default role can access
// Admin can override per-user via allowedMenus[]
const ROLE_DEFAULTS = {
  admin:     ['dashboard','orders','customers','ingredients','baskets','subscription-plans','goals','health-challenges','coupons','apartments','team','wellness-partners'],
  nutrition: ['ingredients','baskets','goals','health-challenges'],
  team:      ['ingredients','apartments'],
};

const Auth = {
  TOKEN_KEY:   'kp_admin_token',
  USER_KEY:    'kp_admin_user',
  ROLE_KEY:    'kp_admin_role',
  MENUS_KEY:   'kp_admin_menus',
  DISPLAY_KEY: 'kp_admin_display',
  MASTER_KEY:  'kp_admin_master',

  getToken()       { return localStorage.getItem(this.TOKEN_KEY); },
  getUsername()    { return localStorage.getItem(this.USER_KEY) || 'admin'; },
  getDisplayName() { return localStorage.getItem(this.DISPLAY_KEY) || this.getUsername(); },
  getRole()        { return localStorage.getItem(this.ROLE_KEY) || 'admin'; },
  isMaster()       { return localStorage.getItem(this.MASTER_KEY) === 'true'; },

  // Returns the set of menu keys this session can see
  getAllowedMenus() {
    const stored = localStorage.getItem(this.MENUS_KEY);
    const role   = this.getRole();
    // If server sent a custom allowedMenus list and it has items, use that
    // Otherwise fall back to role defaults
    if (stored) {
      try {
        const arr = JSON.parse(stored);
        if (Array.isArray(arr) && arr.length) return arr;
      } catch {}
    }
    return ROLE_DEFAULTS[role] || ROLE_DEFAULTS.team;
  },

  canAccess(menuKey) {
    // master admin always has full access
    if (this.isMaster()) return true;
    return this.getAllowedMenus().includes(menuKey);
  },

  setSession(token, username, role, allowedMenus, displayName, isMaster) {
    localStorage.setItem(this.TOKEN_KEY,   token);
    localStorage.setItem(this.USER_KEY,    username || 'admin');
    localStorage.setItem(this.ROLE_KEY,    role     || 'admin');
    localStorage.setItem(this.MENUS_KEY,   JSON.stringify(allowedMenus || []));
    localStorage.setItem(this.DISPLAY_KEY, displayName || username || 'admin');
    localStorage.setItem(this.MASTER_KEY,  isMaster ? 'true' : 'false');
  },

  clear() {
    [this.TOKEN_KEY, this.USER_KEY, this.ROLE_KEY, this.MENUS_KEY, this.DISPLAY_KEY, this.MASTER_KEY]
      .forEach(k => localStorage.removeItem(k));
  },

  isLoggedIn() { return !!this.getToken(); },

  // Redirect to login if not authenticated
  guard() {
    if (!this.isLoggedIn()) { window.location.href = 'index.html'; return; }
  },

  // Redirect to login if not authenticated OR if menuKey is not allowed
  guardMenu(menuKey) {
    this.guard();
    if (!this.canAccess(menuKey)) {
      // Redirect to first allowed page instead of showing 403
      const allowed = this.getAllowedMenus();
      if (allowed.length) {
        window.location.href = allowed[0] === 'dashboard' ? 'dashboard.html' : allowed[0] + '.html';
      } else {
        window.location.href = 'index.html';
      }
    }
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
  presignIngredientImage:   (id, mimeType) => req('GET', `/admin/ingredients/${id}/image/presign${qs({ mimeType })}`),
  confirmIngredientImage:   (id, imageKey, imageUrl) => req('POST', `/admin/ingredients/${id}/image/confirm`, { imageKey, imageUrl }),
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
  presignGoalImage:  (id, mimeType) => req('GET', `/admin/goals/${id}/image/presign${qs({ mimeType })}`),
  confirmGoalImage:  (id, imageKey, imageUrl) => req('POST', `/admin/goals/${id}/image/confirm`, { imageKey, imageUrl }),
  deleteGoalImage:   (id) => req('DELETE', `/admin/goals/${id}/image`),

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

  // Cities
  getCities:       () => req('GET', '/admin/cities'),
  createCity:      (body) => req('POST', '/admin/cities', body),
  updateCity:      (id, body) => req('PUT', `/admin/cities/${id}`, body),
  deleteCity:      (id) => req('DELETE', `/admin/cities/${id}`),
  hardDeleteCity:  (id) => req('DELETE', `/admin/cities/${id}/hard`),

  // Health Challenges
  getHealthChallenges:        () => req('GET', '/admin/health-challenges'),
  createHealthChallenge:      (body) => req('POST', '/admin/health-challenges', body),
  updateHealthChallenge:      (id, body) => req('PUT', `/admin/health-challenges/${id}`, body),
  deleteHealthChallenge:      (id) => req('DELETE', `/admin/health-challenges/${id}`),
  hardDeleteHealthChallenge:  (id) => req('DELETE', `/admin/health-challenges/${id}/hard`),
  presignHealthChallengeImage: (id, mimeType) => req('GET', `/admin/health-challenges/${id}/image/presign${qs({ mimeType })}`),
  confirmHealthChallengeImage: (id, imageKey, imageUrl) => req('POST', `/admin/health-challenges/${id}/image/confirm`, { imageKey, imageUrl }),
  deleteHealthChallengeImage:  (id) => req('DELETE', `/admin/health-challenges/${id}/image`),

  getPreferences:             (params) => req('GET', `/admin/preferences${params?'?'+new URLSearchParams(params):''}`),
  createPreference:           (body) => req('POST', '/admin/preferences', body),
  updatePreference:           (id, body) => req('PUT', `/admin/preferences/${id}`, body),
  deletePreference:           (id) => req('DELETE', `/admin/preferences/${id}`),
  hardDeletePreference:       (id) => req('DELETE', `/admin/preferences/${id}/hard`),

  // Team Users (master admin only)
  getTeamUsers:    () => req('GET', '/admin/team'),
  createTeamUser:  (body) => req('POST', '/admin/team', body),
  updateTeamUser:  (id, body) => req('PUT', `/admin/team/${id}`, body),
  deleteTeamUser:  (id) => req('DELETE', `/admin/team/${id}`),

  // Wellness Partners
  getPartners:         () => req('GET', '/admin/wellness-partners'),
  createPartner:       (body) => req('POST', '/admin/wellness-partners', body),
  updatePartner:       (id, body) => req('PUT', `/admin/wellness-partners/${id}`, body),
  deletePartner:       (id) => req('DELETE', `/admin/wellness-partners/${id}`),
  hardDeletePartner:   (id) => req('DELETE', `/admin/wellness-partners/${id}/hard`),
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

async function uploadIngredientImageToS3(ingredientId, file) {
  const { blob, mimeType } = await compressImageToBlob(file);
  const { signedUrl, imageKey, imageUrl } = await adminApi.presignIngredientImage(ingredientId, mimeType);
  const s3Res = await fetch(signedUrl, {
    method:  'PUT',
    headers: { 'Content-Type': mimeType },
    body:    blob,
  });
  if (!s3Res.ok) throw new Error(`S3 upload failed (HTTP ${s3Res.status}) — check bucket CORS and policy`);
  await adminApi.confirmIngredientImage(ingredientId, imageKey, imageUrl);
  return { imageUrl };
}

async function uploadGoalImageToS3(goalId, file) {
  const { blob, mimeType } = await compressImageToBlob(file);
  const { signedUrl, imageKey, imageUrl } = await adminApi.presignGoalImage(goalId, mimeType);
  const s3Res = await fetch(signedUrl, {
    method:  'PUT',
    headers: { 'Content-Type': mimeType },
    body:    blob,
  });
  if (!s3Res.ok) throw new Error(`S3 upload failed (HTTP ${s3Res.status}) — check bucket CORS and policy`);
  await adminApi.confirmGoalImage(goalId, imageKey, imageUrl);
  return { imageUrl };
}

async function uploadHealthChallengeImageToS3(challengeId, file) {
  const { blob, mimeType } = await compressImageToBlob(file);
  const { signedUrl, imageKey, imageUrl } = await adminApi.presignHealthChallengeImage(challengeId, mimeType);
  const s3Res = await fetch(signedUrl, {
    method:  'PUT',
    headers: { 'Content-Type': mimeType },
    body:    blob,
  });
  if (!s3Res.ok) throw new Error(`S3 upload failed (HTTP ${s3Res.status}) — check bucket CORS and policy`);
  await adminApi.confirmHealthChallengeImage(challengeId, imageKey, imageUrl);
  return { imageUrl };
}
