/* ============================================================
 * StoryForge — Sidebar / shell mounter
 * Uses DOM API (NOT body.innerHTML) so existing element refs
 * and event handlers in inline scripts keep working.
 * ============================================================ */

function _sidebarHTML(active, projId) {
  const u = SF.currentUser();
  const projLink = projId ? '?p=' + encodeURIComponent(projId) : '';
  const item = (id, href, icon, label) =>
    `<a href="${href}" class="${active === id ? 'active' : ''}">${icon} ${label}</a>`;

  return `
    <h2>📚 StoryForge</h2>
    <div class="who">${u ? escapeHtml(u.displayName) : ''}</div>
    <nav>
      ${item('dashboard', 'dashboard.html', '🏠', '대시보드')}
      ${projId ? `
        <div class="sb-section">현재 프로젝트</div>
        ${item('project',   'project.html'   + projLink, '📖', '프로젝트 홈')}
        ${item('character', 'character.html' + projLink, '👥', '등장인물')}
        ${item('relations', 'relations.html' + projLink, '💞', '관계 그래프')}
        ${item('tree',      'family-tree.html'+ projLink, '🌳', '가계도/조직도')}
        ${item('world',     'world.html'     + projLink, '🌍', '세계관')}
        ${item('timeline',  'timeline.html'  + projLink, '⏳', '타임라인')}
        ${item('items',     'items.html'     + projLink, '⚔️', '아이템 도감')}
        ${item('gallery',   'gallery.html'   + projLink, '🖼️', '영감 보드')}
        ${item('editor',    'editor.html'    + projLink, '📝', '문서 / 에디터')}
      ` : ''}
      <div class="sb-section">계정</div>
      ${item('settings', 'settings.html', '⚙️', '설정 / 백업')}
      <a href="#" id="sf-logout">🚪 로그아웃</a>
    </nav>
  `;
}

function mountApp(active) {
  if (!SF.requireAuth()) return false;
  applyTheme();

  // Already mounted? skip
  if (document.querySelector('.app > .sidebar')) return true;

  const body = document.body;
  const projId = getQuery('p');

  // 1. Move all current body children into a new <main>
  const main = document.createElement('main');
  main.className = 'main';
  main.id = 'sf-main';

  // Inject hamburger button at the top of main (mobile)
  const menuBtn = document.createElement('button');
  menuBtn.className = 'menu-btn';
  menuBtn.type = 'button';
  menuBtn.innerHTML = '☰';
  menuBtn.setAttribute('aria-label', '메뉴 열기');
  menuBtn.style.marginBottom = '14px';

  // Move children
  while (body.firstChild) main.appendChild(body.firstChild);
  // Place hamburger as first child of main
  main.insertBefore(menuBtn, main.firstChild);

  // 2. Sidebar
  const sidebar = document.createElement('aside');
  sidebar.className = 'sidebar';
  sidebar.id = 'sf-sidebar';
  sidebar.innerHTML = _sidebarHTML(active || '', projId);

  // 3. Scrim for mobile
  const scrim = document.createElement('div');
  scrim.className = 'scrim';

  // 4. App wrapper
  const app = document.createElement('div');
  app.className = 'app';
  app.appendChild(sidebar);
  app.appendChild(main);

  body.appendChild(app);
  body.appendChild(scrim);
  ensureToastWrap();

  // 5. Wire events
  const close = () => { sidebar.classList.remove('open'); scrim.classList.remove('open'); };
  const open  = () => { sidebar.classList.add('open');    scrim.classList.add('open'); };
  menuBtn.addEventListener('click', open);
  scrim.addEventListener('click', close);
  sidebar.querySelectorAll('nav a').forEach(a => a.addEventListener('click', close));

  const lo = sidebar.querySelector('#sf-logout');
  if (lo) lo.addEventListener('click', e => {
    e.preventDefault();
    SF.logout();
    location.href = 'index.html';
  });

  return true;
}
