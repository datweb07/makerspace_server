import { getPool } from "../models/db/pool";

async function addColumns() {
  const pool = getPool("vi");
  try {
    console.log("Adding schedule_details to workshops.short_courses...");
    await pool.query(`ALTER TABLE workshops.short_courses ADD COLUMN IF NOT EXISTS schedule_details TEXT`);
    console.log("Added schedule_details successfully.");

    console.log("Adding absence_requests to registrations.workshop_bookings...");
    await pool.query(`ALTER TABLE registrations.workshop_bookings ADD COLUMN IF NOT EXISTS absence_requests JSONB DEFAULT '[]'::jsonb`);
    console.log("Added absence_requests successfully.");

  } catch (error) {
    console.error("Error migrating:", error);
  } finally {
    process.exit(0);
  }
}

addColumns();
