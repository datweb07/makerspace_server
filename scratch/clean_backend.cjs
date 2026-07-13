const fs = require('fs');
const path = require('path');

// 1. Schemas
const schemasDir = path.join(__dirname, '../src/schemaValidation');
const schemas = ['student_life.schema.ts', 'projects.schema.ts', 'news.schema.ts', 'events.schema.ts'];
for (const file of schemas) {
  const fp = path.join(schemasDir, file);
  if (fs.existsSync(fp)) {
    let content = fs.readFileSync(fp, 'utf8');
    content = content.replace(/\s*seo_title:\s*z\.string\(\)\.min\([^)]+\),?\r?\n/g, '\n');
    fs.writeFileSync(fp, content);
    console.log('Fixed schema:', file);
  }
}

// 2. Models
const modelsDir = path.join(__dirname, '../src/models');
const models = ['student_life.model.ts', 'projects.model.ts', 'news.model.ts', 'events.model.ts', 'short_courses.model.ts', 'diy.model.ts', 'products.model.ts'];

for (const file of models) {
  const fp = path.join(modelsDir, file);
  if (fs.existsSync(fp)) {
    let content = fs.readFileSync(fp, 'utf8');
    
    // Remove seo_title from INSERT INTO statements (posts)
    content = content.replace(/seo_title,\s*/g, '');
    
    // Fix values ($1, $2, $3, $4...) - this is tricky because the indices will be off. 
    // It's safer to just let the SQL fail if indices are wrong? No, we MUST fix the indices.
    // Let's do it manually via a smarter regex or just string replacement for the known patterns.
  }
}
