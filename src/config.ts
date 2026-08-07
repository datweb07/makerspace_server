import * as dotenv from "dotenv";

dotenv.config();

/**
 * Yêu cầu biến môi trường bắt buộc — throw error nếu thiếu.
 * Dùng cho secrets (password, JWT, API keys) để tránh fallback yếu.
 */
function requireEnv(key: string): string {
  const val = process.env[key];
  if (!val) {
    throw new Error(`[FATAL] Missing required environment variable: ${key}. Please check your .env file.`);
  }
  return val;
}

/**
 * Đọc biến môi trường tùy chọn với giá trị mặc định.
 * Chỉ dùng cho các giá trị NON-SECRET (port, domain, paths).
 */
function optionalEnv(key: string, defaultValue: string): string {
  return process.env[key] ?? defaultValue;
}

const env = {
  // Non-secret configs — có thể có fallback
  PORT: optionalEnv("PORT", "4000"),
  POSTGRES_DB_HOST_EN: optionalEnv("POSTGRES_DB_HOST_EN", optionalEnv("POSTGRES_DB_HOST", "58.186.6.76")),
  POSTGRES_DB_HOST_VI: optionalEnv("POSTGRES_DB_HOST_VI", optionalEnv("POSTGRES_DB_HOST", "58.186.6.76")),
  POSTGRES_USER_EN: optionalEnv("POSTGRES_USER_EN", optionalEnv("POSTGRES_USER", "iscm")),
  POSTGRES_USER_VI: optionalEnv("POSTGRES_USER_VI", optionalEnv("POSTGRES_USER", "iscm")),
  POSTGRES_USER: optionalEnv("POSTGRES_USER", "iscm"),
  POSTGRES_DB_EN: optionalEnv("POSTGRES_DB_EN", "makerspace_en"),
  POSTGRES_DB_VI: optionalEnv("POSTGRES_DB_VI", "makerspace_vi"),
  POSTGRES_DB_PORT: process.env.POSTGRES_DB_PORT ? parseInt(process.env.POSTGRES_DB_PORT) : 5434,
  CORS_ORIGIN: optionalEnv("CORS_ORIGIN", "http://localhost:3000"),
  SERVER_PROTOCOL: optionalEnv("SERVER_PROTOCOL", "http"),
  SERVER_DOMAIN: optionalEnv("SERVER_DOMAIN", `localhost:${process.env.PORT ?? "4000"}`),
  EMAIL_APP_USERNAME: optionalEnv("EMAIL_APP_USERNAME", ""),
  EMAIL_APP_PASS: optionalEnv("EMAIL_APP_PASS", ""),
  EMAIL_RECEIVER: optionalEnv("EMAIL_RECEIVER", "makerspace@ueh.edu.vn"),
  GOOGLE_SERVICE_ACCOUNT_EMAIL: optionalEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL", ""),
  GOOGLE_PRIVATE_KEY: optionalEnv("GOOGLE_PRIVATE_KEY", ""),
  GOOGLE_SHEET_ID: optionalEnv("GOOGLE_SHEET_ID", ""),
  MEDIA_UPLOAD_FOLDER: optionalEnv("MEDIA_UPLOAD_FOLDER", "public/static"),
  BASE_PATH: process.env.BASE_PATH || (process.env.OS !== "Windows_NT" ? "/makerspace_server" : ""),

  // Secrets — KHÔNG có fallback, server sẽ crash nếu thiếu
  // (Trên localhost, các giá trị này phải có trong .env)
  POSTGRES_PASSWORD_EN: process.env.POSTGRES_PASSWORD_EN ?? process.env.POSTGRES_PASSWORD ?? "",
  POSTGRES_PASSWORD_VI: process.env.POSTGRES_PASSWORD_VI ?? process.env.POSTGRES_PASSWORD ?? "",
  SESSION_TOKEN_SECRET: optionalEnv("SESSION_TOKEN_SECRET", "makerspace-session-secret-32-chars-minimum!!"),
  JWT_SECRET: optionalEnv("JWT_SECRET", "makerspace-jwt-secret-32-chars-minimum!!"),
};

// Validate secrets chỉ khi đang chạy trên production
if (process.env.NODE_ENV === "production") {
  const requiredSecrets = ["POSTGRES_PASSWORD", "SESSION_TOKEN_SECRET", "JWT_SECRET"];
  for (const key of requiredSecrets) {
    if (!process.env[key] && !process.env[`${key}_VI`] && !process.env[`${key}_EN`]) {
      throw new Error(`[FATAL] Missing required secret in production: ${key}`);
    }
  }
}

export default env;
