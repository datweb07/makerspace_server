import envConfig from "../config";
export const DEFAULT_API_PREFIX = envConfig.BASE_PATH ? `${envConfig.BASE_PATH}/api` : "/api";
export const APP_NAME = "makerspace_server";
export const DEFAULT_PAGE_SIZE = 20;
