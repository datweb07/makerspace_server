import { Pool } from "pg";
import envConfig from "../../config";

export const pool = new Pool({
  connectionString: envConfig.DATABASE_URL,
});
