/* ===== Sidebar nav (shared) ===== */
function renderSidebar(active = '') {
  const u = SF.currentUser();
  const proj = getQuery('p');
  const projLink = proj ? `?p=${proj}` : '';
  return `
  <aside class="sidebar" id="sidebar">
    <h2>📚 StoryForge</h2>
    <div class="muted" style="margin: 0 12px 12px; font-size:12px;">
      ${u ? escapeHtml(u.displayName) : ''}
    </div>
    <nav>
      <a href="dashboard.html" class="${active==='dashboard'?'active':''}">🏠 대시보드</a>
      ${proj ? `
        <div class="sb-section">현재 프로젝트</div>
        <a href="project.html${projLink}" class="${active==='project'?'active':''}">📖 프로젝트 홈</a>
        <a href="character.html${projLink}" class="${active==='character'?'active':''}">👥 등장인물</a>
        <a href="family-tree.html${projLink}" class="${active==='tree'?'active':''}">🌳 관계도/조직도</a>
        <a href="world.html${projLink}" class="${active==='world'?'active':''}">🌍 세계관</a>
        <a href="timeline.html${projLink}" class="${active==='timeline'?'active':''}">⏳ 타임라인</a>
        <a href="editor.html${projLink}" class="${active==='editor'?'active':''}">📝 문서 / 에디터</a>
      ` : ''}
      <div class="sb-section">계정</div>
      <a href="settings.html" class="${active==='settings'?'active':''}">⚙️ 설정 / 백업</a>
      <a href="#" id="logoutLink">🚪 로그아웃</a>
    </nav>
  </aside>`;
}

function mountApp(active = '') {
  if (!SF.requireAuth()) return;
  applyTheme();
  const root = document.body;
  const original = root.innerHTML;
  root.innerHTML = `<div class="app">${renderSidebar(active)}<main class="main" id="mainContent">${original}</main></div>`;
  $('#logoutLink')?.addEventListener('click', e => {
    e.preventDefault();
    SF.logout();
    location.href = 'index.html';
  });
}
