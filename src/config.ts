import * as dotenv from "dotenv";

dotenv.config();

const env = {
  PORT: process.env.PORT ?? "4000",
  POSTGRES_DB_HOST_EN: process.env.POSTGRES_DB_HOST_EN ?? process.env.POSTGRES_DB_HOST ?? "localhost",
  POSTGRES_DB_HOST_VI: process.env.POSTGRES_DB_HOST_VI ?? process.env.POSTGRES_DB_HOST ?? "localhost",
  POSTGRES_USER_EN: process.env.POSTGRES_USER_EN ?? process.env.POSTGRES_USER ?? "postgres",
  POSTGRES_USER_VI: process.env.POSTGRES_USER_VI ?? process.env.POSTGRES_USER ?? "postgres",
  POSTGRES_USER: process.env.POSTGRES_USER ?? "postgres",
  POSTGRES_PASSWORD_EN: process.env.POSTGRES_PASSWORD_EN ?? process.env.POSTGRES_PASSWORD ?? "postgres",
  POSTGRES_PASSWORD_VI: process.env.POSTGRES_PASSWORD_VI ?? process.env.POSTGRES_PASSWORD ?? "postgres",
  POSTGRES_DB_EN: process.env.POSTGRES_DB_EN ?? "makerspace_en",
  POSTGRES_DB_VI: process.env.POSTGRES_DB_VI ?? "makerspace_vi",
  POSTGRES_DB_PORT: process.env.POSTGRES_DB_PORT ? parseInt(process.env.POSTGRES_DB_PORT) : 5432,
  SESSION_TOKEN_SECRET: process.env.SESSION_TOKEN_SECRET ?? "makerspace-session-secret-32-chars-minimum!!",
  JWT_SECRET: process.env.JWT_SECRET ?? "makerspace-jwt-secret-32-chars-minimum!!",
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  SERVER_PROTOCOL: process.env.SERVER_PROTOCOL ?? "http",
  SERVER_DOMAIN: process.env.SERVER_DOMAIN ?? `localhost:${process.env.PORT ?? "4000"}`,
  EMAIL_APP_USERNAME: process.env.EMAIL_APP_USERNAME ?? "",
  EMAIL_APP_PASS: process.env.EMAIL_APP_PASS ?? "",
  GOOGLE_SERVICE_ACCOUNT_EMAIL: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? "",
  GOOGLE_PRIVATE_KEY: process.env.GOOGLE_PRIVATE_KEY ?? "",
  GOOGLE_SHEET_ID: process.env.GOOGLE_SHEET_ID ?? "",
  MEDIA_UPLOAD_FOLDER: process.env.MEDIA_UPLOAD_FOLDER ?? "public/static",
  BASE_PATH: process.env.BASE_PATH ?? "",
};

export default env;
