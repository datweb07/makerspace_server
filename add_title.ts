import { getPool } from "./src/models/db/pool";

async function main() {
  const pools = [getPool('vi'), getPool('en')];
  
  for (const pool of pools) {
    try {
      await pool.query("ALTER TABLE people.interns ADD COLUMN IF NOT EXISTS title text;");
      console.log("Added title column to interns");
    } catch(e: any) {
      console.log("Interns error:", e.message);
    }
  }
}

main().then(() => process.exit(0));
