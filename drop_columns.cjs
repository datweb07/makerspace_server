const { Pool } = require('pg');
require('dotenv').config();

const alterTableSQL = `
ALTER TABLE posts.careers 
DROP COLUMN IF EXISTS seo_title,
DROP COLUMN IF EXISTS description,
DROP COLUMN IF EXISTS cover_image,
DROP COLUMN IF EXISTS created_at,
DROP COLUMN IF EXISTS updated_at;
`;

async function main() {
  const poolEn = new Pool({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_DB_HOST,
    database: process.env.POSTGRES_DB_EN,
    password: process.env.POSTGRES_PASSWORD,
    port: parseInt(process.env.POSTGRES_DB_PORT || '5432'),
  });

  const poolVi = new Pool({
    user: process.env.POSTGRES_USER,
    host: process.env.POSTGRES_DB_HOST,
    database: process.env.POSTGRES_DB_VI,
    password: process.env.POSTGRES_PASSWORD,
    port: parseInt(process.env.POSTGRES_DB_PORT || '5432'),
  });

  try {
    await poolEn.query(alterTableSQL);
    console.log('Dropped columns in mswebsite_en');
  } catch (err) {
    console.error('Error in EN:', err.message);
  }

  try {
    await poolVi.query(alterTableSQL);
    console.log('Dropped columns in mswebsite_vi');
  } catch (err) {
    console.error('Error in VI:', err.message);
  }

  await poolEn.end();
  await poolVi.end();
}

main();
