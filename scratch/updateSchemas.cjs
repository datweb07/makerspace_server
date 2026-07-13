const fs = require('fs');
const path = require('path');

const schemaDir = path.join(__dirname, '../src/schemaValidation');
const files = fs.readdirSync(schemaDir).filter(f => f.endsWith('.schema.ts'));

const transformLogic = `.transform(val => {
    if (!val) return val;
    const match = val.match(/^https?:\\/\\/[^\\/]+\\/(public\\/static\\/images\\/.*)$/);
    return match ? match[1] : val;
  })`;

for (const file of files) {
  const filePath = path.join(schemaDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Replace occurrences of cover_image: z.string()... without breaking existing transforms
  // We'll just look for standard definitions and append the transform.
  const regexes = [
    /(cover_image:\s*z\.string\(\).*?)(?=,$)/gm,
    /(image:\s*z\.string\(\).*?)(?=,$)/gm,
    /(thumbnail:\s*z\.string\(\).*?)(?=,$)/gm
  ];

  for (const regex of regexes) {
    content = content.replace(regex, (match, p1) => {
      if (match.includes('.transform(')) return match; // Skip if already has transform
      changed = true;
      return `${p1}${transformLogic}`;
    });
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
}
