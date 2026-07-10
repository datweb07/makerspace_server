const { Pool } = require('pg');
require('dotenv').config();

const createTableSQL = `
CREATE TABLE IF NOT EXISTS posts.careers (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    deadline VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'open',
    content TEXT,
    seo_title VARCHAR(255),
    description TEXT,
    cover_image VARCHAR(255),
    publish_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    draft BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
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
    await poolEn.query(createTableSQL);
    console.log('Created posts.careers in mswebsite_en');
  } catch (err) {
    console.error('Error in EN:', err.message);
  }

  try {
    await poolVi.query(createTableSQL);
    console.log('Created posts.careers in mswebsite_vi');
  } catch (err) {
    console.error('Error in VI:', err.message);
  }

  await poolEn.end();
  await poolVi.end();
}

main();
