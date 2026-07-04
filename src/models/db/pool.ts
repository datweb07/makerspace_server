import { Pool } from "pg";
import envConfig from "../../config";

const pools: Partial<Record<string, Pool>> = {};

export function getPool(lang: string = "vi") {
  if (!pools[lang]) {
    pools[lang] = new Pool({
      user: lang === "en" ? envConfig.POSTGRES_USER_EN : envConfig.POSTGRES_USER_VI,
      host: lang === "en" ? envConfig.POSTGRES_DB_HOST_EN : envConfig.POSTGRES_DB_HOST_VI,
      database:
        lang === "en" ? envConfig.POSTGRES_DB_EN : envConfig.POSTGRES_DB_VI,
      password: lang === "en" ? envConfig.POSTGRES_PASSWORD_EN : envConfig.POSTGRES_PASSWORD_VI,
      port: envConfig.POSTGRES_DB_PORT,
      ssl: (lang === "en" ? envConfig.POSTGRES_DB_HOST_EN : envConfig.POSTGRES_DB_HOST_VI).includes("supabase") 
        ? { rejectUnauthorized: false } 
        : undefined,
      max: 500,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }
  return pools[lang]!;
}
