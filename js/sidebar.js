// admin/js/sidebar.js — KRISHA PURE Admin Console sidebar
// Two nav sections: Main Operations + Nutrition Engine

const NAV_SECTIONS = [
  {
    label: 'Main',
    items: [
      { key: 'dashboard',         href: 'dashboard.html',         label: 'Dashboard',          icon: 'M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z M9 21V12h6v9' },
      { key: 'orders',            href: 'orders.html',            label: 'Orders',             icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2 M9 3h6v4H9z M9 12h6 M9 16h4' },
      { key: 'customers',         href: 'customers.html',         label: 'Customers',          icon: 'M16 19v-1a4 4 0 00-4-4H6a4 4 0 00-4 4v1 M9 11a3 3 0 100-6 3 3 0 000 6z M22 19v-1a3.5 3.5 0 00-3-3.5 M16 4.2a3 3 0 010 5.6' },
      { key: 'coupons',           href: 'coupons.html',           label: 'Coupons',            icon: 'M3 7a2 2 0 012-2h14a2 2 0 012 2v3a2 2 0 000 4v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3a2 2 0 000-4z M9 7v10' },
      { key: 'apartments',        href: 'apartments.html',        label: 'Apartments',         icon: 'M3 21h18 M5 21V7l7-4 7 4v14 M9 21v-6h6v6' },
      { key: 'wellness-partners', href: 'wellness-partners.html', label: 'Wellness Partners',  icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75 M9 11a4 4 0 100-8 4 4 0 000 8z' },
      { key: 'approvals',          href: 'approvals.html',          label: 'Approvals',           icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
      { key: 'team',              href: 'team.html',              label: 'Team & Access',      icon: 'M12 15a4 4 0 100-8 4 4 0 000 8z M2 21a10 10 0 0120 0 M8.5 8.5a4 4 0 015.2-.3' },
      { key: 'subscription-plans', href: 'subscription-plans.html', label: 'Delivery Frequency', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2zM9 12h6M9 16h4' },
      { key: 'subscription-durations', href: 'subscription-durations.html', label: 'Subscription Durations', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
      { key: 'appointments',      href: 'appointments.html',      label: 'Appointments',       icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
      { key: 'announcements',     href: 'announcements.html',     label: 'Announcements',      icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
    ],
  },
  {
    label: 'Nutrition Engine',
    items: [
      { key: 'products',                  href: 'products.html',                  label: 'Products',                   icon: 'M12 2C7 6 4 10 4 14a8 8 0 0016 0c0-4-3-8-8-12z' },
      { key: 'product-categories',        href: 'product-categories.html',        label: 'Product Categories',         icon: 'M4 6h16M4 10h16M4 14h8' },
      { key: 'wellness-goals',            href: 'wellness-goals.html',            label: 'Wellness Goals',             icon: 'M12 2a10 10 0 1010 10A10 10 0 0012 2z M12 6a6 6 0 106 6 6 6 0 00-6-6z M12 10a2 2 0 102 2 2 2 0 00-2-2z' },
      { key: 'health-conditions',         href: 'health-conditions.html',         label: 'Health Conditions',          icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M9 12l2 2 4-4' },
      { key: 'activity-levels',           href: 'activity-levels.html',           label: 'Activity Levels',            icon: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z' },
      { key: 'lifestyle-codes',           href: 'lifestyle-codes.html',           label: 'Lifestyle Codes',            icon: 'M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z' },
      { key: 'bmi-rules',                 href: 'bmi-rules.html',                 label: 'BMI Rules',                  icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
      { key: 'curated-baskets',           href: 'curated-baskets.html',           label: 'Curated Baskets',            icon: 'M3 9h18l-2 11H5L3 9z M3 9l2-5h14l2 5' },
      { key: 'basket-goal-mapping',       href: 'basket-goal-mapping.html',       label: 'Basket → Goal Mapping',      icon: 'M8 6h13 M8 12h13 M8 18h13 M3 6h.01 M3 12h.01 M3 18h.01' },
      { key: 'condition-basket-mapping',  href: 'condition-basket-mapping.html',  label: 'Condition → Basket',         icon: 'M4 6h16 M4 10h16 M4 14h16 M4 18h16' },
      { key: 'goal-macro-rules',          href: 'goal-macro-rules.html',          label: 'Goal Macro Rules',           icon: 'M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2 M15 2H9a1 1 0 00-1 1v2a1 1 0 001 1h6a1 1 0 001-1V3a1 1 0 00-1-1z' },
      { key: 'condition-modifier-rules',  href: 'condition-modifier-rules.html',  label: 'Condition Modifiers',        icon: 'M12 20h9 M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z' },
      { key: 'rule-conflict-priority',    href: 'rule-conflict-priority.html',    label: 'Rule Priority',              icon: 'M12 2L2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5' },
      { key: 'nutrient-coverage-targets', href: 'nutrient-coverage-targets.html', label: 'Nutrient Coverage',          icon: 'M22 12h-4l-3 9L9 3l-3 9H2' },
      { key: 'basket-nutrient-shares',    href: 'basket-nutrient-shares.html',    label: 'Basket Nutrient Shares',     icon: 'M18 20V10 M12 20V4 M6 20v-6' },
      { key: 'plan-types',               href: 'plan-types.html',               label: 'Plan Types (T20/T30/T40)',   icon: 'M9 11l3 3L22 4 M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11' },
      { key: 'allergies',                 href: 'allergies.html',                 label: 'Allergies',                  icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M9 12l2 2 4-4' },
      { key: 'met-ranges',                href: 'met-ranges.html',                label: 'MET Ranges',                 icon: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z' },
    ],
  },
];

// Flat list for access checking
const NAV_ITEMS = NAV_SECTIONS.flatMap(s => s.items);

const ROLE_LABELS = {
  admin:     { label: 'Admin',        color: '#2D6A35', bg: 'rgba(45,106,53,.15)' },
  nutrition: { label: 'Nutritionist', color: '#7B5E2A', bg: 'rgba(201,168,76,.2)' },
  team:      { label: 'Team Member',  color: '#3A5F8A', bg: 'rgba(58,95,138,.15)' },
};

function iconSvg(path) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${
    path.split(' M').map((seg, i) => `<path d="${i === 0 ? seg : 'M' + seg}"/>`).join('')
  }</svg>`;
}

function renderShell({ active, title, sub, actions = '' }) {
  document.title = `${title} · KRISHA PURE Admin`;

  const allowed  = Auth.getAllowedMenus();
  const role     = Auth.getRole();
  const roleMeta = ROLE_LABELS[role] || ROLE_LABELS.admin;

  const navHtml = NAV_SECTIONS.map(section => {
    const visibleItems = section.items.filter(item => Auth.isMaster() || allowed.includes(item.key));
    if (!visibleItems.length) return '';

    const itemsHtml = visibleItems.map(item => `
      <a href="${item.href}" class="${item.key === active ? 'active' : ''}">
        ${iconSvg(item.icon)}<span>${item.label}</span>
      </a>
    `).join('');

    return `
      <div class="nav-section">
        <div class="nav-section-label">${section.label}</div>
        ${itemsHtml}
      </div>
    `;
  }).join('');

  const shell = document.createElement('div');
  shell.className = 'shell';
  shell.innerHTML = `
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-brand">
        <img class="sidebar-logo" src="Krisha_Pure_transparent.png" alt="Krisha Pure" />
        <div class="word"><small>Admin Console</small></div>
      </div>
      <div class="sidebar-rule"></div>
      <nav class="sidebar-nav">${navHtml}</nav>
      <div class="sidebar-foot">
        <div class="who">
          <div style="font-size:11px;color:rgba(255,255,255,.5);margin-bottom:2px">Signed in as</div>
          <div style="font-weight:600;color:#fff;font-size:13px">${escapeHtml(Auth.getDisplayName())}</div>
          <span style="display:inline-block;margin-top:4px;font-size:10px;font-weight:700;
            letter-spacing:.5px;padding:2px 8px;border-radius:20px;
            color:${roleMeta.color};background:${roleMeta.bg};">
            ${roleMeta.label}
          </span>
        </div>
        <button class="logout-btn" id="logout-btn">Log Out</button>
      </div>
    </aside>
    <div class="main">
      <header class="topbar">
        <div>
          <h1>${title}</h1>
          ${sub ? `<div class="sub">${sub}</div>` : ''}
        </div>
        <div class="topbar-actions">${actions}</div>
      </header>
      <main class="content" id="content"></main>
    </div>
  `;
  document.body.prepend(shell);

  document.getElementById('logout-btn').addEventListener('click', () => {
    if (confirm('Log out of the admin console?')) {
      Auth.clear();
      window.location.href = 'index.html';
    }
  });

  return document.getElementById('content');
}
