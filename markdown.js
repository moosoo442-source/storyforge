/* ===== Tiny Markdown renderer (no deps) ===== */
/* Supports: headings, bold, italic, strikethrough, inline code, code blocks,
   links, images, lists (ul/ol), blockquotes, hr, simple tables, raw HTML & iframe. */

function renderMD(src) {
  if (!src) return '';
  src = String(src).replace(/\r\n/g, '\n');

  // Extract code fences first
  const codes = [];
  src = src.replace(/```([\w-]*)\n([\s\S]*?)```/g, (_, lang, code) => {
    codes.push(`<pre><code class="lang-${lang}">${escapeHtml(code)}</code></pre>`);
    return `\u0000CODE${codes.length-1}\u0000`;
  });

  // Tables  | a | b |
  //         |---|---|
  //         | 1 | 2 |
  src = src.replace(/(^|\n)((?:\|.*\|\n)+)/g, (m, lead, block) => {
    const rows = block.trim().split('\n').map(r => r.trim());
    if (rows.length < 2 || !/^\|[\s:-|]+\|$/.test(rows[1])) return m;
    const head = rows[0].slice(1,-1).split('|').map(s=>s.trim());
    const body = rows.slice(2).map(r => r.slice(1,-1).split('|').map(s=>s.trim()));
    let out = '<table><thead><tr>' + head.map(h=>`<th>${inline(h)}</th>`).join('') + '</tr></thead><tbody>';
    body.forEach(r => { out += '<tr>' + r.map(c=>`<td>${inline(c)}</td>`).join('') + '</tr>'; });
    out += '</tbody></table>';
    return lead + out;
  });

  // Block-level
  const lines = src.split('\n');
  let out = '', inUl=false, inOl=false, inBq=false;
  function closeLists() {
    if (inUl) { out += '</ul>'; inUl=false; }
    if (inOl) { out += '</ol>'; inOl=false; }
    if (inBq) { out += '</blockquote>'; inBq=false; }
  }
  for (let raw of lines) {
    const line = raw;
    if (/^\s*$/.test(line)) { closeLists(); continue; }
    let m;
    if (m = line.match(/^(#{1,6})\s+(.*)$/)) {
      closeLists();
      out += `<h${m[1].length}>${inline(m[2])}</h${m[1].length}>`;
      continue;
    }
    if (/^\s*([-*_])\s*\1\s*\1[\s\1]*$/.test(line)) { closeLists(); out+='<hr>'; continue; }
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
      out += inline(m[1]) + '<br>';
      continue;
    }
    closeLists();
    // Allow raw <iframe>, <video>, <img> blocks unchanged
    if (/^\s*<(iframe|video|img|div|details|summary|section|article|figure)/i.test(line)) {
      out += line; continue;
    }
    out += `<p>${inline(line)}</p>`;
  }
  closeLists();

  // Restore code fences
  out = out.replace(/\u0000CODE(\d+)\u0000/g, (_, i) => codes[+i]);
  return out;
}

function inline(s) {
  if (!s) return '';
  // images: ![alt](url)
  s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]+)")?\)/g,
    (_, a, u, t) => `<img alt="${escapeHtml(a)}" src="${escapeAttr(u)}" ${t?`title="${escapeHtml(t)}"`:''} loading="lazy">`);
  // links: [text](url)
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g,
    (_, t, u) => `<a href="${escapeAttr(u)}" target="_blank" rel="noopener">${escapeHtml(t)}</a>`);
  // bold **x** , italic *x* , strike ~~x~~ , code `x`
  s = s.replace(/`([^`]+)`/g, (_, c) => `<code>${escapeHtml(c)}</code>`);
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  s = s.replace(/~~([^~]+)~~/g, '<del>$1</del>');
  return s;
}

function escapeAttr(s) {
  return String(s).replace(/[<>"]/g, m => ({'<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
}
