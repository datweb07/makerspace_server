import { getPool } from "../models/db/pool";

async function main() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS people.technicals (
      id VARCHAR(255) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      title VARCHAR(255),
      bio TEXT,
      email VARCHAR(255),
      phone VARCHAR(255),
      cover_image VARCHAR(255),
      display_order INT DEFAULT 0,
      draft BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    const viPool = getPool("vi");
    await viPool.query(createTableQuery);
    console.log("Successfully created people.technicals in vi database");
    
    const enPool = getPool("en");
    await enPool.query(createTableQuery);
    console.log("Successfully created people.technicals in en database");
  } catch (error) {
    console.error("Error creating tables:", error);
  } finally {
    process.exit(0);
  }
}

main();
