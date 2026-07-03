import * as dotenv from "dotenv";

dotenv.config();

const env = {
  PORT: process.env.PORT ?? "4000",
  DATABASE_URL: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/makerspace",
  SESSION_TOKEN_SECRET: process.env.SESSION_TOKEN_SECRET ?? "makerspace-session-secret-32-chars-minimum!!",
  JWT_SECRET: process.env.JWT_SECRET ?? "makerspace-jwt-secret-32-chars-minimum!!",
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? "http://localhost:3000",
};

export default env;
