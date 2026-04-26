/* ============================================================
 * StoryForge — tiny markdown renderer
 *  Supports: headings, bold, italic, strike, inline code, code blocks,
 *  links, images, lists (ul/ol), blockquotes, hr, simple tables,
 *  raw HTML blocks (iframe/img/video/details/etc.).
 * ============================================================ */
function renderMD(src) {
  if (!src) return '';
  src = String(src).replace(/\r\n/g, '\n');

  // 1. Extract code fences
  const codes = [];
  src = src.replace(/```([\w-]*)\n([\s\S]*?)```/g, (_, lang, code) => {
    codes.push(`<pre><code class="lang-${escapeHtml(lang)}">${escapeHtml(code)}</code></pre>`);
    return `\u0000C${codes.length - 1}\u0000`;
  });

  // 2. Tables
  src = src.replace(/(^|\n)((?:\|.*\|\n)+)/g, (m, lead, block) => {
    const rows = block.trim().split('\n').map(r => r.trim());
    if (rows.length < 2) return m;
    if (!/^\|[\s:|-]+\|$/.test(rows[1])) return m;
    const head = rows[0].slice(1, -1).split('|').map(s => s.trim());
    const body = rows.slice(2).map(r => r.slice(1, -1).split('|').map(s => s.trim()));
    let out = '<table><thead><tr>' + head.map(h => `<th>${inline(h)}</th>`).join('') + '</tr></thead><tbody>';
    body.forEach(r => { out += '<tr>' + r.map(c => `<td>${inline(c)}</td>`).join('') + '</tr>'; });
    out += '</tbody></table>';
    return lead + out;
  });

  // 3. Block-level
  const lines = src.split('\n');
  let out = '', inUl = false, inOl = false, inBq = false, inRaw = false;
  function closeLists() {
    if (inUl) { out += '</ul>'; inUl = false; }
    if (inOl) { out += '</ol>'; inOl = false; }
    if (inBq) { out += '</blockquote>'; inBq = false; }
  }
  for (let raw of lines) {
    const line = raw;
    // Pass-through raw HTML lines (iframe / img / video / div / details / table / etc.)
    if (/^\s*<\/?(iframe|video|img|audio|div|details|summary|section|article|figure|figcaption|hr)/i.test(line)) {
      closeLists(); out += line + '\n'; continue;
    }
    if (/^\s*$/.test(line)) { closeLists(); continue; }
    let m;
    if (m = line.match(/^(#{1,6})\s+(.*)$/)) {
      closeLists();
      out += `<h${m[1].length}>${inline(m[2])}</h${m[1].length}>`; continue;
    }
    if (/^\s*([-*_])\1\1[\s\1]*$/.test(line)) { closeLists(); out += '<hr>'; continue; }
    if (m = line.match(/^\s*[-*+]\s+(.*)$/)) {
      if (!inUl) { closeLists(); out += '<ul>'; inUl = true; }
      out += `<li>${inline(m[1])}</li>`; continue;
    }
    if (m = line.match(/^\s*\d+\.\s+(.*)$/)) {
      if (!inOl) { closeLists(); out += '<ol>'; inOl = true; }
      out += `<li>${inline(m[1])}</li>`; continue;
    }
    if (m = line.match(/^>\s?(.*)$/)) {
      if (!inBq) { closeLists(); out += '<blockquote>'; inBq = true; }
      out += inline(m[1]) + '<br>'; continue;
    }
    closeLists();
    out += `<p>${inline(line)}</p>`;
  }
  closeLists();

  // 4. Restore code blocks
  out = out.replace(/\u0000C(\d+)\u0000/g, (_, i) => codes[+i]);
  return out;
}

function inline(s) {
  if (!s) return '';
  // Inline code first
  s = s.replace(/`([^`]+)`/g, (_, c) => `<code>${escapeHtml(c)}</code>`);
  // Images
  s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]+)")?\)/g,
    (_, a, u, t) => `<img alt="${escapeAttr(a)}" src="${escapeAttr(u)}"${t ? ` title="${escapeAttr(t)}"` : ''} loading="lazy">`);
  // Links
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g,
    (_, t, u) => `<a href="${escapeAttr(u)}" target="_blank" rel="noopener">${escapeHtml(t)}</a>`);
  // Bold / italic / strike
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  s = s.replace(/~~([^~]+)~~/g, '<del>$1</del>');
  return s;
}
