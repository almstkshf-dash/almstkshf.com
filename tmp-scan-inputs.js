const fs = require('fs');
const path = require('path');
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(d =>
    d.isDirectory() ? walk(path.join(dir, d.name)) : [path.join(dir, d.name)]
  );
}
const files = walk('src').filter(f => /\.(tsx|jsx|ts|js)$/.test(f));
const inputRe = /<input\b[\s\S]*?>/g;
const idNameRe = /\b(id|name)\s*=/;
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  let m;
  while ((m = inputRe.exec(text)) !== null) {
    const tag = m[0];
    if (!idNameRe.test(tag)) {
      const line = text.slice(0, m.index).split('\n').length;
      console.log(`${file}:${line}: ${tag.replace(/\s+/g, ' ')}`);
    }
  }
}
