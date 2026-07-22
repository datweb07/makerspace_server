import pg from 'pg';
const { Pool } = pg;

const sql = `
CREATE SCHEMA IF NOT EXISTS accounts;
CREATE TABLE IF NOT EXISTS accounts.members (
    id SERIAL PRIMARY KEY,
    username VARCHAR(200) UNIQUE NOT NULL,
    password VARCHAR(500),
    role VARCHAR(20) DEFAULT 'member',
    auth_provider VARCHAR(100)
);
CREATE TABLE IF NOT EXISTS accounts.guests (
    id SERIAL PRIMARY KEY,
    username VARCHAR(200) UNIQUE NOT NULL,
    password VARCHAR(500),
    role VARCHAR(20) DEFAULT 'guest',
    auth_provider VARCHAR(100)
);
`;

async function run(dbName) {
  const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: dbName,
    password: '123456',
    port: 5432,
  });

  try {
    await pool.query(sql);
    console.log(`Successfully migrated ${dbName}`);
  } catch (err) {
    console.error(`Error migrating ${dbName}:`, err);
  } finally {
    await pool.end();
  }
}

async function main() {
  await run('mswebsite_en');
  await run('mswebsite_vi');
}

main();
