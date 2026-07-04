import { SignerOptions, createSigner, createVerifier } from "fast-jwt";
import envConfig from "../config";

export const signSessionToken = (payload: any, options?: SignerOptions) => {
  const signSync = createSigner({
    key: envConfig.SESSION_TOKEN_SECRET,
    algorithm: "HS256",
    expiresIn: "7d",
    ...options,
  });
  return signSync(payload);
};

export const verifySessionToken = (token: string) => {
  const verifySync = createVerifier({
    key: envConfig.SESSION_TOKEN_SECRET,
  });
  return verifySync(token);
};
