import { getPool } from "../models/db/pool";

async function run() {
  try {
    console.log("Adding columns to workshops.short_courses...");
    await getPool("vi").query(`
      ALTER TABLE workshops.short_courses 
      ADD COLUMN IF NOT EXISTS start_time timestamp with time zone,
      ADD COLUMN IF NOT EXISTS end_time timestamp with time zone,
      ADD COLUMN IF NOT EXISTS max_participants integer,
      ADD COLUMN IF NOT EXISTS type character varying,
      ADD COLUMN IF NOT EXISTS status character varying;
    `);
    console.log("Columns added successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error adding columns:", error);
    process.exit(1);
  }
}

run();
