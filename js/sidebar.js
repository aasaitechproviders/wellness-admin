// admin/js/sidebar.js — renders the shared sidebar + topbar shell into every page.
// Usage: const content = renderShell({ active: 'orders', title: 'Orders', sub: '...' })

const NAV_ITEMS = [
  { key: 'dashboard',          href: 'dashboard.html',          label: 'Dashboard',            icon: 'M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z M9 21V12h6v9' },
  { key: 'orders',              href: 'orders.html',              label: 'Orders',               icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2 M9 3h6v4H9z M9 12h6 M9 16h4' },
  { key: 'customers',           href: 'customers.html',           label: 'Customers',            icon: 'M16 19v-1a4 4 0 00-4-4H6a4 4 0 00-4 4v1 M9 11a3 3 0 100-6 3 3 0 000 6z M22 19v-1a3.5 3.5 0 00-3-3.5 M16 4.2a3 3 0 010 5.6' },
  { key: 'ingredients',         href: 'ingredients.html',         label: 'Products',             icon: 'M12 2C7 6 4 10 4 14a8 8 0 0016 0c0-4-3-8-8-12z' },
  { key: 'baskets',             href: 'baskets.html',             label: 'Curated Baskets',      icon: 'M3 9h18l-2 11H5L3 9z M3 9l2-5h14l2 5' },
  { key: 'subscription-plans',  href: 'subscription-plans.html',  label: 'Subscription Packages',icon: 'M4 4h16v16H4z M4 9h16 M9 4v16' },
  { key: 'goals',               href: 'goals.html',               label: 'Wellness Goals',       icon: 'M12 2a10 10 0 1010 10A10 10 0 0012 2z M12 6a6 6 0 106 6 6 6 0 00-6-6z M12 10a2 2 0 102 2 2 2 0 00-2-2z' },
  { key: 'coupons',             href: 'coupons.html',             label: 'Coupons',              icon: 'M3 7a2 2 0 012-2h14a2 2 0 012 2v3a2 2 0 000 4v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3a2 2 0 000-4z M9 7v10' },
  { key: 'apartments',          href: 'apartments.html',          label: 'Apartments',           icon: 'M3 21h18 M5 21V7l7-4 7 4v14 M9 21v-6h6v6' },
];

function iconSvg(path) {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${
    path.split(' M').map((seg, i) => `<path d="${i === 0 ? seg : 'M' + seg}"/>`).join('')
  }</svg>`;
}

function renderShell({ active, title, sub, actions = '' }) {
  document.title = `${title} · KRISHA PURE Admin`;

  const navHtml = NAV_ITEMS.map(item => `
    <a href="${item.href}" class="${item.key === active ? 'active' : ''}">
      ${iconSvg(item.icon)}<span>${item.label}</span>
    </a>
  `).join('');

  const shell = document.createElement('div');
  shell.className = 'shell';
  shell.innerHTML = `
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-brand">
        <div class="mark">🌿</div>
        <div class="word"><b>KRISHA PURE</b><small>Admin Console</small></div>
      </div>
      <div class="sidebar-rule"></div>
      <nav class="sidebar-nav">${navHtml}</nav>
      <div class="sidebar-foot">
        <div class="who">Signed in as <b id="who-username">admin</b></div>
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

  document.getElementById('who-username').textContent = Auth.getUsername();
  document.getElementById('logout-btn').addEventListener('click', () => {
    if (confirm('Log out of the admin console?')) {
      Auth.clear();
      window.location.href = 'index.html';
    }
  });

  return document.getElementById('content');
}
