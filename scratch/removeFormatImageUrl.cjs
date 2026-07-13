const fs = require('fs');
const path = require('path');

const controllersDir = path.join(__dirname, '..', 'src', 'controllers');
const files = fs.readdirSync(controllersDir).filter(f => f.endsWith('.ts'));

for (const file of files) {
  const filePath = path.join(controllersDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Remove import
  const importRegex = /import\s+\{\s*formatImageUrl\s*\}\s+from\s+['"]\.\.\/utils\/formatImageUrl['"];?\r?\n?/g;
  if (importRegex.test(content)) {
    content = content.replace(importRegex, '');
    changed = true;
  }

  // Replace formatImageUrl(XXX) with XXX
  const funcRegex = /formatImageUrl\s*\(([^)]+)\)/g;
  if (funcRegex.test(content)) {
    content = content.replace(funcRegex, '$1');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
}
console.log("Done removing formatImageUrl!");
