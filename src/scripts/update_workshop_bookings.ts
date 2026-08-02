import { getPool } from "../models/db/pool";

async function main() {
  const poolEn = getPool("en");
  const poolVi = getPool("vi");

  const query1 = `
    ALTER TABLE registrations.workshop_bookings DROP CONSTRAINT IF EXISTS workshop_bookings_schedule_id_fkey;
  `;
  const query2 = `
    ALTER TABLE registrations.workshop_bookings ADD COLUMN IF NOT EXISTS participants INTEGER NOT NULL DEFAULT 1;
    ALTER TABLE registrations.workshop_bookings ADD COLUMN IF NOT EXISTS workshop_type VARCHAR(50) DEFAULT 'diy';
    ALTER TABLE registrations.workshop_bookings ALTER COLUMN workshop_id TYPE VARCHAR(255);
  `;
  
  console.log("Updating EN database...");
  await poolEn.query(query1);
  try { await poolEn.query(`ALTER TABLE registrations.workshop_bookings RENAME COLUMN schedule_id TO workshop_id;`); } catch (e) {}
  await poolEn.query(query2);
  console.log("EN database updated.");

  console.log("Updating VI database...");
  await poolVi.query(query1);
  try { await poolVi.query(`ALTER TABLE registrations.workshop_bookings RENAME COLUMN schedule_id TO workshop_id;`); } catch (e) {}
  await poolVi.query(query2);
  console.log("VI database updated.");
  
  console.log("Done.");
  process.exit(0);
}

main().catch(console.error);
