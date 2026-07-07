const { Client } = require('pg');

async function migrate(dbName) {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: dbName,
    password: '123456',
    port: 5432,
  });
  
  await client.connect();
  console.log(`Connected to ${dbName}`);
  
  const tables = ['workshops.diy', 'workshops.short_courses', 'workshops.schedules'];
  
  for (const table of tables) {
    try {
      await client.query(`ALTER TABLE ${table} ADD COLUMN draft boolean DEFAULT false`);
      console.log(`Added draft column to ${table} in ${dbName}`);
    } catch (e) {
      console.log(`Column might already exist or error in ${table} (${dbName}):`, e.message);
    }
  }
  
  await client.end();
}

async function run() {
  await migrate('mswebsite_vi');
  await migrate('mswebsite_en');
}

run();
