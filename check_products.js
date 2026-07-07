const { Client } = require('pg');

async function checkDB(dbName) {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: dbName,
    password: '123456',
    port: 5432,
  });
  
  try {
    await client.connect();
    
    console.log(`\n--- Checking ${dbName} ---`);
    const tablesRes = await client.query("SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema = 'products'");
    console.log('Tables:', tablesRes.rows);
    
    if (tablesRes.rows.length > 0) {
      const catRes = await client.query("SELECT * FROM products.categories");
      console.log('Categories count:', catRes.rows.length);
      console.log('Categories data:', catRes.rows);
      
      const itemsRes = await client.query("SELECT * FROM products.items");
      console.log('Items count:', itemsRes.rows.length);
    }
  } catch (err) {
    console.error(`Error checking ${dbName}:`, err.message);
  } finally {
    await client.end();
  }
}

async function main() {
  await checkDB('mswebsite_vi');
  await checkDB('mswebsite_en');
}

main();
