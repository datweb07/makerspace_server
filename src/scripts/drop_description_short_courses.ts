import { getPool } from "../models/db/pool";

async function dropDescriptionColumn() {
  try {
    console.log("Dropping column 'description' from workshops.short_courses...");
    
    await getPool("vi").query(`
      ALTER TABLE workshops.short_courses
      DROP COLUMN IF EXISTS description;
    `);
    
    console.log("Migration completed successfully.");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    process.exit(0);
  }
}

dropDescriptionColumn();
