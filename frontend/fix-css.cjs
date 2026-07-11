const fs = require('fs');
const path = require('path');

const replaceMap = {
  '--bg-primary': '--surface',
  '--bg-secondary': '--surface-2',
  '--bg-tertiary': '--surface-2',
  '--border-color': '--border',
  '--text-primary': '--text',
  '--text-secondary': '--text-muted',
  '--accent-blue': '--accent',
  '#2563eb': 'var(--accent-hover)',
  '#6b7280': 'var(--text-muted)',
  '#4b5563': 'var(--text-subtle)',
};

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.css') || file.endsWith('.jsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('d:/1.BuiTr/3.Môn đang học/DATN-nhuatbutweb/frontend/src/components');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  Object.keys(replaceMap).forEach(key => {
    if (content.includes(key)) {
      content = content.split(key).join(replaceMap[key]);
      changed = true;
    }
  });
  
  if (content.includes('.butdanh-container {')) {
     content = content.replace(/background-color: var\(--surface\);/g, 'background: transparent;');
     content = content.replace(/box-shadow:.*?;/g, '');
     content = content.replace(/padding: 20px;/g, '');
     changed = true;
  }
  
  if (content.includes('.loaibao-container {')) {
     content = content.replace(/background-color: var\(--surface\);/g, 'background: transparent;');
     content = content.replace(/box-shadow:.*?;/g, '');
     content = content.replace(/padding: 20px;/g, '');
     changed = true;
  }
  
  if (content.includes('.tracuu-container {')) {
     content = content.replace(/background-color: var\(--surface\);/g, 'background: transparent;');
     content = content.replace(/box-shadow:.*?;/g, '');
     content = content.replace(/padding: 20px;/g, '');
     changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Updated', file);
  }
});
