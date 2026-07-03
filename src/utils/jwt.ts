export const createTokenPayload = (userId: string) => ({
  sub: userId,
  issuedAt: new Date().toISOString(),
});
