const fs = require('fs');
const path = require('path');

const files = [
  'd:/1.BuiTr/3.Môn đang học/DATN-nhuatbutweb/frontend/src/components/ButDanh/ButDanh.css',
  'd:/1.BuiTr/3.Môn đang học/DATN-nhuatbutweb/frontend/src/components/LoaiBao/LoaiBao.css',
  'd:/1.BuiTr/3.Môn đang học/DATN-nhuatbutweb/frontend/src/components/TraCuu/TraCuu.css'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Fix input backgrounds
  content = content.replace(/background: transparent;/g, 'background: var(--input-bg);');
  
  // Container should be transparent, so let's just make sure container has no bg
  content = content.replace(/.butdanh-container {\s*background: var\(--input-bg\);/g, '.butdanh-container {\n  background: transparent;');
  content = content.replace(/.loaibao-container {\s*background: var\(--input-bg\);/g, '.loaibao-container {\n  background: transparent;');
  content = content.replace(/.tracuu-container {\s*background: var\(--input-bg\);/g, '.tracuu-container {\n  background: transparent;');

  // Fix box-shadow if it got removed weirdly
  // Wait, I can just write nice button styles
  const btnStyles = `
.btn-luu, .btn-huy, .btn-search, .btn-print {
  padding: 0.75rem 1.35rem;
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 700;
  font-size: 0.9rem;
  font-family: inherit;
  cursor: pointer;
  transition: transform 0.2s, filter 0.2s;
  box-shadow: 0 6px 20px rgba(34, 211, 238, 0.22);
}

.btn-luu, .btn-search {
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%);
  color: #fff;
}

.btn-luu:hover, .btn-search:hover {
  transform: translateY(-2px);
  filter: brightness(1.05);
}

.btn-huy, .btn-print {
  background: var(--text-subtle);
  color: #fff;
  box-shadow: none;
}

.btn-huy:hover, .btn-print:hover {
  transform: translateY(-2px);
  filter: brightness(1.05);
}
`;

  // Remove old button styles
  content = content.replace(/\.btn-luu, \.btn-huy \{[\s\S]*?\.btn-huy:hover \{[\s\S]*?\}/g, btnStyles);
  content = content.replace(/\.btn-search, \.btn-print \{[\s\S]*?\.btn-print:hover \{[\s\S]*?\}/g, btnStyles);

  // Focus effect for inputs
  content = content.replace(/border-color: var\(--accent\);\s*}/g, 'border-color: var(--accent);\n  box-shadow: 0 0 0 3px var(--accent-muted);\n  background: var(--surface-2);\n}');

  fs.writeFileSync(file, content);
  console.log('Fixed', file);
});
