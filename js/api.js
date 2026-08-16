// admin/js/api.js — KRISHA PURE Admin Console shared API client + auth helpers

const API_BASE = 'https://hf7d5uklwbvj2syjjromiyrkxy0mlcqp.lambda-url.ap-southeast-2.on.aws';

const ROLE_DEFAULTS = {
  admin:     ['dashboard','orders','customers','coupons','apartments','wellness-partners','team','appointments',
              'approvals','subscription-plans','plan-types',
              'products','wellness-goals','health-conditions','activity-levels','lifestyle-codes',
              'bmi-rules','curated-baskets','basket-goal-mapping','condition-basket-mapping',
              'goal-macro-rules','condition-modifier-rules','rule-conflict-priority','nutrient-coverage-targets','basket-nutrient-shares'],
  nutrition: ['products','wellness-goals','health-conditions','activity-levels','lifestyle-codes','appointments',
              'bmi-rules','curated-baskets','basket-goal-mapping','condition-basket-mapping',
              'goal-macro-rules','condition-modifier-rules','rule-conflict-priority','nutrient-coverage-targets','basket-nutrient-shares'],
  team:      ['apartments','orders','customers'],
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

  getAllowedMenus() {
    const stored = localStorage.getItem(this.MENUS_KEY);
    const role   = this.getRole();
    if (stored) {
      try {
        const arr = JSON.parse(stored);
        if (Array.isArray(arr) && arr.length) return arr;
      } catch {}
    }
    return ROLE_DEFAULTS[role] || ROLE_DEFAULTS.team;
  },

  canAccess(menuKey) {
    if (this.isMaster()) return true;
    return this.getAllowedMenus().includes(menuKey);
  },

  setSession(token, username, role, allowedMenus, displayName, isMaster) {
    localStorage.setItem(this.TOKEN_KEY,   token);
    localStorage.setItem(this.USER_KEY,    username    || 'admin');
    localStorage.setItem(this.ROLE_KEY,    role        || 'admin');
    localStorage.setItem(this.MENUS_KEY,   JSON.stringify(allowedMenus || []));
    localStorage.setItem(this.DISPLAY_KEY, displayName || username || 'admin');
    localStorage.setItem(this.MASTER_KEY,  isMaster ? 'true' : 'false');
  },

  clear() {
    [this.TOKEN_KEY, this.USER_KEY, this.ROLE_KEY, this.MENUS_KEY, this.DISPLAY_KEY, this.MASTER_KEY]
      .forEach(k => localStorage.removeItem(k));
  },

  isLoggedIn() { return !!this.getToken(); },

  guard() {
    if (!this.isLoggedIn()) { window.location.href = 'index.html'; }
  },

  guardMenu(menuKey) {
    this.guard();
    if (!this.canAccess(menuKey)) {
      const allowed = this.getAllowedMenus();
      window.location.href = allowed.length ? allowed[0] + '.html' : 'index.html';
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

  // Dashboard / Reports
  dashboard:          () => req('GET', '/admin/dashboard'),
  salesReport:        (p) => req('GET', `/admin/reports/sales${qs(p)}`),
  subscriptionReport: () => req('GET', '/admin/reports/subscriptions'),

  // Orders
  getOrders:    (p)         => req('GET', `/admin/orders${qs(p)}`),
  getOrder:     (id)        => req('GET', `/admin/orders/${id}`),
  updateStatus: (id, status)=> req('PUT', `/admin/orders/${id}/status`, { status }),

  // Customers
  getCustomers:   (p)              => req('GET', `/admin/customers${qs(p)}`),
  getCustomer:    (id)             => req('GET', `/admin/customers/${id}`),
  updateCustomer: (id, body)       => req('PUT', `/admin/customers/${id}`, body),
  addMember:      (id, body)       => req('POST', `/admin/customers/${id}/members`, body),
  updateMember:   (id, mid, body)  => req('PUT', `/admin/customers/${id}/members/${mid}`, body),
  deleteMember:   (id, mid)        => req('DELETE', `/admin/customers/${id}/members/${mid}`),

  // Coupons
  getCoupons:       ()         => req('GET', '/admin/coupons'),
  createCoupon:     (body)     => req('POST', '/admin/coupons', body),
  updateCoupon:     (id, body) => req('PUT', `/admin/coupons/${id}`, body),
  deleteCoupon:     (id)       => req('DELETE', `/admin/coupons/${id}`),
  hardDeleteCoupon: (id)       => req('DELETE', `/admin/coupons/${id}/hard`),

  // Apartments
  getApartments:       ()         => req('GET', '/admin/apartments'),
  createApartment:     (body)     => req('POST', '/admin/apartments', body),
  updateApartment:     (id, body) => req('PUT', `/admin/apartments/${id}`, body),
  deleteApartment:     (id)       => req('DELETE', `/admin/apartments/${id}`),

  // Cities
  getCities:           ()         => req('GET', '/admin/cities'),
  createCity:          (body)     => req('POST', '/admin/cities', body),
  updateCity:          (id, body) => req('PUT', `/admin/cities/${id}`, body),
  deleteCity:          (id)       => req('DELETE', `/admin/cities/${id}`),

  // Wellness Partners
  getPartners:       ()         => req('GET', '/admin/wellness-partners'),
  createPartner:     (body)     => req('POST', '/admin/wellness-partners', body),
  updatePartner:     (id, body) => req('PUT', `/admin/wellness-partners/${id}`, body),
  deletePartner:     (id)       => req('DELETE', `/admin/wellness-partners/${id}`),

  // Team Users
  getTeamUsers:   ()         => req('GET', '/admin/team'),
  createTeamUser: (body)     => req('POST', '/admin/team', body),
  updateTeamUser: (id, body) => req('PUT', `/admin/team/${id}`, body),
  deleteTeamUser: (id)       => req('DELETE', `/admin/team/${id}`),

  // ── Nutrition Engine ──────────────────────────────────────────────

  // Products (kp_products)
  getProducts:    (p)         => req('GET', `/admin/nutrition/products${qs(p)}`),
  getProduct:     (id)        => req('GET', `/admin/nutrition/products/${id}`),
  createProduct:  (body)      => req('POST', '/admin/nutrition/products', body),
  updateProduct:  (id, body)  => req('PUT', `/admin/nutrition/products/${id}`, body),
  deleteProduct:  (id)        => req('DELETE', `/admin/nutrition/products/${id}`),

  // Wellness Goals (kp_wellnessGoals)
  getWellnessGoals:   (p)         => req('GET', `/admin/nutrition/wellness-goals${qs(p)}`),
  createWellnessGoal: (body)      => req('POST', '/admin/nutrition/wellness-goals', body),
  updateWellnessGoal: (id, body)  => req('PUT', `/admin/nutrition/wellness-goals/${id}`, body),
  deleteWellnessGoal: (id)        => req('DELETE', `/admin/nutrition/wellness-goals/${id}`),

  // Health Conditions (kp_healthConditions)
  getHealthConditions:   (p)         => req('GET', `/admin/nutrition/health-conditions${qs(p)}`),
  createHealthCondition: (body)      => req('POST', '/admin/nutrition/health-conditions', body),
  updateHealthCondition: (id, body)  => req('PUT', `/admin/nutrition/health-conditions/${id}`, body),
  deleteHealthCondition: (id)        => req('DELETE', `/admin/nutrition/health-conditions/${id}`),

  // Activity Levels (kp_activityLevels)
  getActivityLevels:   (p)         => req('GET', `/admin/nutrition/activity-levels${qs(p)}`),
  createActivityLevel: (body)      => req('POST', '/admin/nutrition/activity-levels', body),
  updateActivityLevel: (id, body)  => req('PUT', `/admin/nutrition/activity-levels/${id}`, body),
  deleteActivityLevel: (id)        => req('DELETE', `/admin/nutrition/activity-levels/${id}`),

  // Lifestyle Codes (kp_lifestyleCodes)
  getLifestyleCodes:   (p)         => req('GET', `/admin/nutrition/lifestyle-codes${qs(p)}`),
  createLifestyleCode: (body)      => req('POST', '/admin/nutrition/lifestyle-codes', body),
  updateLifestyleCode: (id, body)  => req('PUT', `/admin/nutrition/lifestyle-codes/${id}`, body),
  deleteLifestyleCode: (id)        => req('DELETE', `/admin/nutrition/lifestyle-codes/${id}`),

  // BMI Rules (kp_bmiRules)
  getBmiRules:   (p)         => req('GET', `/admin/nutrition/bmi-rules${qs(p)}`),
  createBmiRule: (body)      => req('POST', '/admin/nutrition/bmi-rules', body),
  updateBmiRule: (id, body)  => req('PUT', `/admin/nutrition/bmi-rules/${id}`, body),
  deleteBmiRule: (id)        => req('DELETE', `/admin/nutrition/bmi-rules/${id}`),

  // Curated Baskets (kp_curatedBaskets)
  getCuratedBaskets:   (p)         => req('GET', `/admin/nutrition/curated-baskets${qs(p)}`),
  createCuratedBasket: (body)      => req('POST', '/admin/nutrition/curated-baskets', body),
  updateCuratedBasket: (id, body)  => req('PUT', `/admin/nutrition/curated-baskets/${id}`, body),
  deleteCuratedBasket: (id)        => req('DELETE', `/admin/nutrition/curated-baskets/${id}`),

  // Basket → Goal Mapping (kp_basketGoalMappings)
  getBasketGoalMappings:   (p)         => req('GET', `/admin/nutrition/basket-goal-mappings${qs(p)}`),
  createBasketGoalMapping: (body)      => req('POST', '/admin/nutrition/basket-goal-mappings', body),
  updateBasketGoalMapping: (id, body)  => req('PUT', `/admin/nutrition/basket-goal-mappings/${id}`, body),
  deleteBasketGoalMapping: (id)        => req('DELETE', `/admin/nutrition/basket-goal-mappings/${id}`),

  // Condition → Basket Mapping (kp_conditionBasketMappings)
  getConditionBasketMappings:   (p)         => req('GET', `/admin/nutrition/condition-basket-mappings${qs(p)}`),
  createConditionBasketMapping: (body)      => req('POST', '/admin/nutrition/condition-basket-mappings', body),
  updateConditionBasketMapping: (id, body)  => req('PUT', `/admin/nutrition/condition-basket-mappings/${id}`, body),
  deleteConditionBasketMapping: (id)        => req('DELETE', `/admin/nutrition/condition-basket-mappings/${id}`),

  // Goal Macro Rules (kp_goalMacroRules)
  getGoalMacroRules:   (p)         => req('GET', `/admin/nutrition/goal-macro-rules${qs(p)}`),
  createGoalMacroRule: (body)      => req('POST', '/admin/nutrition/goal-macro-rules', body),
  updateGoalMacroRule: (id, body)  => req('PUT', `/admin/nutrition/goal-macro-rules/${id}`, body),
  deleteGoalMacroRule: (id)        => req('DELETE', `/admin/nutrition/goal-macro-rules/${id}`),

  // Condition Modifier Rules (kp_conditionModifierRules)
  getConditionModifierRules:   (p)         => req('GET', `/admin/nutrition/condition-modifier-rules${qs(p)}`),
  createConditionModifierRule: (body)      => req('POST', '/admin/nutrition/condition-modifier-rules', body),
  updateConditionModifierRule: (id, body)  => req('PUT', `/admin/nutrition/condition-modifier-rules/${id}`, body),
  deleteConditionModifierRule: (id)        => req('DELETE', `/admin/nutrition/condition-modifier-rules/${id}`),

  // Rule Conflict Priority (kp_ruleConflictPriority)
  getRuleConflictPriorities:   (p)         => req('GET', `/admin/nutrition/rule-conflict-priority${qs(p)}`),
  createRuleConflictPriority:  (body)      => req('POST', '/admin/nutrition/rule-conflict-priority', body),
  updateRuleConflictPriority:  (id, body)  => req('PUT', `/admin/nutrition/rule-conflict-priority/${id}`, body),
  deleteRuleConflictPriority:  (id)        => req('DELETE', `/admin/nutrition/rule-conflict-priority/${id}`),

  // Nutrient Coverage Targets (kp_nutrientCoverageTargets)
  getNutrientCoverageTargets:   (p)         => req('GET', `/admin/nutrition/nutrient-coverage-targets${qs(p)}`),
  createNutrientCoverageTarget: (body)      => req('POST', '/admin/nutrition/nutrient-coverage-targets', body),
  updateNutrientCoverageTarget: (id, body)  => req('PUT', `/admin/nutrition/nutrient-coverage-targets/${id}`, body),
  deleteNutrientCoverageTarget: (id)        => req('DELETE', `/admin/nutrition/nutrient-coverage-targets/${id}`),

  // Plan Types (T20 / T30 / T40)
  getPlanTypes:    ()          => req('GET',    '/admin/nutrition/plan-types'),
  createPlanType:  (body)      => req('POST',   '/admin/nutrition/plan-types', body),
  updatePlanType:  (id, body)  => req('PUT',    `/admin/nutrition/plan-types/${id}`, body),
  deletePlanType:  (id)        => req('DELETE', `/admin/nutrition/plan-types/${id}`),

  // Basket Nutrient Shares (kp_basketNutrientShares)
  getBasketNutrientShares:   (p)         => req('GET', `/admin/nutrition/basket-nutrient-shares${qs(p)}`),
  createBasketNutrientShare: (body)      => req('POST', '/admin/nutrition/basket-nutrient-shares', body),
  updateBasketNutrientShare: (id, body)  => req('PUT', `/admin/nutrition/basket-nutrient-shares/${id}`, body),
  deleteBasketNutrientShare: (id)        => req('DELETE', `/admin/nutrition/basket-nutrient-shares/${id}`),

  // Appointments
  getAppointments:      (p)         => req('GET', `/admin/appointments${qs(p)}`),
  getAppointment:       (id)        => req('GET', `/admin/appointments/${id}`),
  assignAppointment:    (id, body)  => req('PUT', `/admin/appointments/${id}/assign`, body),
  completeAppointment:  (id, body)  => req('PUT', `/admin/appointments/${id}/complete`, body),
  cancelAppointment:    (id)        => req('PUT', `/admin/appointments/${id}/cancel`),
  startCall:            (id)        => req('PUT', `/admin/appointments/${id}/call`),
  endCall:              (id)        => req('PUT', `/admin/appointments/${id}/end-call`),
  getCallStatus:        (id)        => req('GET', `/admin/appointments/${id}/call-status`),

  // Subscription Plans (subscriptionPlans)
  getSubscriptionPlans:    ()         => req('GET', '/admin/subscription-plans'),
  createSubscriptionPlan:  (body)     => req('POST', '/admin/subscription-plans', body),
  updateSubscriptionPlan:  (id, body) => req('PUT', `/admin/subscription-plans/${id}`, body),
  deleteSubscriptionPlan:  (id)       => req('DELETE', `/admin/subscription-plans/${id}`),
  hardDeleteSubscriptionPlan: (id)    => req('DELETE', `/admin/subscription-plans/${id}/hard`),

  // MET Ranges (kp_metRanges)
  getMetRanges:    (p)         => req('GET', `/admin/nutrition/met-ranges${qs(p)}`),
  createMetRange:  (body)      => req('POST', '/admin/nutrition/met-ranges', body),
  updateMetRange:  (id, body)  => req('PUT', `/admin/nutrition/met-ranges/${id}`, body),
  deleteMetRange:  (id)        => req('DELETE', `/admin/nutrition/met-ranges/${id}`),

  // Allergies (kp_allergies)
  getAllergies:    (p)         => req('GET', `/admin/nutrition/allergies${qs(p)}`),
  createAllergen: (body)      => req('POST', '/admin/nutrition/allergies', body),
  updateAllergen: (id, body)  => req('PUT', `/admin/nutrition/allergies/${id}`, body),
  deleteAllergen: (id)        => req('DELETE', `/admin/nutrition/allergies/${id}`),
};

// ── Shared utilities ──────────────────────────────────────────────────────────

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
  return String(str).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

function compressImageToBlob(file, maxDim = 1200, quality = 0.88) {
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
