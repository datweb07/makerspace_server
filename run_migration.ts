import { getPool } from "./src/models/db/pool";

async function main() {
  const pool = getPool('vi');
  try {
    await pool.query("ALTER TABLE people.staff ADD COLUMN draft BOOLEAN DEFAULT false;");
    console.log("Added draft to staff");
  } catch(e: any) {
    console.log("Staff draft error:", e.message);
  }
  
  try {
    await pool.query("ALTER TABLE people.interns ADD COLUMN draft BOOLEAN DEFAULT false;");
    console.log("Added draft to interns");
  } catch(e: any) {
    console.log("Interns draft error:", e.message);
  }
}
main().then(() => process.exit(0));
