const { Client } = require('pg');

async function updateDB(dbName) {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: dbName,
    password: '123456',
    port: 5432,
  });
  
  try {
    await client.connect();
    console.log(`\n--- Updating ${dbName} ---`);
    await client.query("ALTER TABLE products.categories ADD COLUMN IF NOT EXISTS draft BOOLEAN DEFAULT false;");
    await client.query("ALTER TABLE products.items ADD COLUMN IF NOT EXISTS draft BOOLEAN DEFAULT false;");
    console.log(`Successfully added draft column to ${dbName}`);
  } catch (err) {
    console.error(`Error updating ${dbName}:`, err.message);
  } finally {
    await client.end();
  }
}

async function main() {
  await updateDB('mswebsite_vi');
  await updateDB('mswebsite_en');
}

main();
