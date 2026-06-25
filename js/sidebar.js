// admin/js/sidebar.js — renders the shared sidebar + topbar shell into every page.
// Usage: const content = renderShell({ active: 'orders', title: 'Orders', sub: '...' })

const NAV_ITEMS = [
  { key: 'dashboard',          href: 'dashboard.html',          label: 'Dashboard',            icon: 'M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z M9 21V12h6v9' },
  { key: 'orders',             href: 'orders.html',             label: 'Orders',               icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2 M9 3h6v4H9z M9 12h6 M9 16h4' },
  { key: 'customers',          href: 'customers.html',          label: 'Customers',            icon: 'M16 19v-1a4 4 0 00-4-4H6a4 4 0 00-4 4v1 M9 11a3 3 0 100-6 3 3 0 000 6z M22 19v-1a3.5 3.5 0 00-3-3.5 M16 4.2a3 3 0 010 5.6' },
  { key: 'ingredients',        href: 'ingredients.html',        label: 'Products',             icon: 'M12 2C7 6 4 10 4 14a8 8 0 0016 0c0-4-3-8-8-12z' },
  { key: 'baskets',            href: 'baskets.html',            label: 'Curated Baskets',      icon: 'M3 9h18l-2 11H5L3 9z M3 9l2-5h14l2 5' },
  { key: 'subscription-plans', href: 'subscription-plans.html', label: 'Subscription Packages',icon: 'M4 4h16v16H4z M4 9h16 M9 4v16' },
  { key: 'goals',              href: 'goals.html',              label: 'Wellness Goals',       icon: 'M12 2a10 10 0 1010 10A10 10 0 0012 2z M12 6a6 6 0 106 6 6 6 0 00-6-6z M12 10a2 2 0 102 2 2 2 0 00-2-2z' },
  { key: 'health-challenges',   href: 'health-challenges.html',  label: 'Health Challenges',    icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M9 12l2 2 4-4' },
  { key: 'coupons',            href: 'coupons.html',            label: 'Coupons',              icon: 'M3 7a2 2 0 012-2h14a2 2 0 012 2v3a2 2 0 000 4v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3a2 2 0 000-4z M9 7v10' },
  { key: 'apartments',         href: 'apartments.html',         label: 'Apartments',           icon: 'M3 21h18 M5 21V7l7-4 7 4v14 M9 21v-6h6v6' },
  { key: 'wellness-partners',  href: 'wellness-partners.html',  label: 'Wellness Partners',    icon: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75 M9 11a4 4 0 100-8 4 4 0 000 8z' },
  { key: 'team',               href: 'team.html',               label: 'Team & Access',        icon: 'M12 15a4 4 0 100-8 4 4 0 000 8z M2 21a10 10 0 0120 0 M8.5 8.5a4 4 0 015.2-.3' },
];

const ROLE_LABELS = {
  admin:     { label: 'Admin',       color: '#2D6A35', bg: 'rgba(45,106,53,.15)' },
  nutrition: { label: 'Nutritionist',color: '#7B5E2A', bg: 'rgba(201,168,76,.2)'  },
  team:      { label: 'Team Member', color: '#3A5F8A', bg: 'rgba(58,95,138,.15)'  },
};

function iconSvg(path) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${
    path.split(' M').map((seg, i) => `<path d="${i === 0 ? seg : 'M' + seg}"/>`).join('')
  }</svg>`;
}

function renderShell({ active, title, sub, actions = '' }) {
  document.title = `${title} · KRISHA PURE Admin`;

  const allowed = Auth.getAllowedMenus();
  const role    = Auth.getRole();
  const roleMeta = ROLE_LABELS[role] || ROLE_LABELS.admin;

  // Only show nav items the current session is allowed to see
  const visibleNav = NAV_ITEMS.filter(item => Auth.isMaster() || allowed.includes(item.key));

  const navHtml = visibleNav.map(item => `
    <a href="${item.href}" class="${item.key === active ? 'active' : ''}">
      ${iconSvg(item.icon)}<span>${item.label}</span>
    </a>
  `).join('');

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
