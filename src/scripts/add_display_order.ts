import { Pool } from "pg";
import envConfig from "../config";

async function main() {
  const viPool = new Pool({
    host: envConfig.POSTGRES_DB_HOST_VI,
    port: envConfig.POSTGRES_DB_PORT,
    user: envConfig.POSTGRES_USER_VI,
    password: envConfig.POSTGRES_PASSWORD_VI,
    database: envConfig.POSTGRES_DB_VI,
  });

  const enPool = new Pool({
    host: envConfig.POSTGRES_DB_HOST_EN,
    port: envConfig.POSTGRES_DB_PORT,
    user: envConfig.POSTGRES_USER_EN,
    password: envConfig.POSTGRES_PASSWORD_EN,
    database: envConfig.POSTGRES_DB_EN,
  });

  const queries = [
    "ALTER TABLE people.staff ADD COLUMN display_order INT DEFAULT 0;",
    "ALTER TABLE people.interns ADD COLUMN display_order INT DEFAULT 0;",
    "ALTER TABLE people.club_members ADD COLUMN display_order INT DEFAULT 0;",
  ];

  for (const q of queries) {
    try {
      await viPool.query(q);
      console.log(`VI: Executed ${q}`);
    } catch (e: any) {
      console.log(`VI: Error ${e.message}`);
    }
    try {
      await enPool.query(q);
      console.log(`EN: Executed ${q}`);
    } catch (e: any) {
      console.log(`EN: Error ${e.message}`);
    }
  }
  process.exit(0);
}

main();
