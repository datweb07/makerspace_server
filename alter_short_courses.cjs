const { Pool } = require('pg');
require('dotenv').config();

const alterTableSQL = `
ALTER TABLE workshops.short_courses 
ADD COLUMN IF NOT EXISTS location VARCHAR(255),
ADD COLUMN IF NOT EXISTS language VARCHAR(50),
ADD COLUMN IF NOT EXISTS level VARCHAR(50),
ADD COLUMN IF NOT EXISTS experience_requirements TEXT,
ADD COLUMN IF NOT EXISTS objectives TEXT,
ADD COLUMN IF NOT EXISTS structure JSONB,
ADD COLUMN IF NOT EXISTS offer_by JSONB,
ADD COLUMN IF NOT EXISTS summarize JSONB;
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
    console.log('Altered workshops.short_courses in mswebsite_en');
  } catch (err) {
    console.error('Error in EN:', err.message);
  }

  try {
    await poolVi.query(alterTableSQL);
    console.log('Altered workshops.short_courses in mswebsite_vi');
  } catch (err) {
    console.error('Error in VI:', err.message);
  }

  await poolEn.end();
  await poolVi.end();
}

main();
