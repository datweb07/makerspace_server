const { Pool } = require('pg');

const tables = [
  'posts.events',
  'posts.featured_projects',
  'posts.news',
  'posts.student_life',
  'products.categories',
  'products.items',
  'workshops.diy',
  'workshops.short_courses',
  'posts.careers' // Just in case, let's try dropping it from careers too if it exists.
];

async function dropColumnFromDb(dbName) {
  console.log(`\nConnecting to ${dbName}...`);
  const pool = new Pool({
    host: 'localhost',
    user: 'postgres',
    password: '123456',
    database: dbName,
    port: 5432
  });

  for (const table of tables) {
    try {
      await pool.query(`ALTER TABLE ${table} DROP COLUMN IF EXISTS seo_title`);
      console.log(`[OK] Dropped seo_title from ${table} in ${dbName}`);
    } catch (e) {
      console.error(`[ERROR] Failed to drop seo_title from ${table} in ${dbName}: ${e.message}`);
    }
  }
  await pool.end();
}

async function run() {
  await dropColumnFromDb('mswebsite_vi');
  await dropColumnFromDb('mswebsite_en');
  console.log('\nMigration complete.');
}

run();
