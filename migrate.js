const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function main() {
  try {
    await pool.query("ALTER TABLE people.staff ADD COLUMN draft BOOLEAN DEFAULT false;");
    console.log("Added draft to staff");
    await pool.query("ALTER TABLE people.interns ADD COLUMN draft BOOLEAN DEFAULT false;");
    console.log("Added draft to interns");
  } catch(e) {
    if (e.code === '42701') {
      console.log("Column draft already exists");
    } else {
      console.error(e);
    }
  } finally {
    pool.end();
  }
}
main();
