import { getPool } from "./src/models/db/pool";

async function main() {
  const pools = [getPool('vi'), getPool('en')];
  
  for (const pool of pools) {
    try {
      await pool.query("ALTER TABLE people.staff DROP COLUMN IF EXISTS role, DROP COLUMN IF EXISTS created_at, DROP COLUMN IF EXISTS updated_at;");
      console.log("Dropped staff columns");
    } catch(e: any) {
      console.log("Staff error:", e.message);
    }
    
    try {
      await pool.query("ALTER TABLE people.interns DROP COLUMN IF EXISTS university, DROP COLUMN IF EXISTS major, DROP COLUMN IF EXISTS period, DROP COLUMN IF EXISTS created_at, DROP COLUMN IF EXISTS updated_at;");
      console.log("Dropped interns columns");
    } catch(e: any) {
      console.log("Interns error:", e.message);
    }
  }
}

main().then(() => process.exit(0));
