declare global {
  type LangType = "vi" | "en";

  interface FastifyInstance {}

}

declare module "fastify" {
  interface FastifyRequest {
    lang: LangType;
    cookies: {
      sessionToken?: string;
    };
  }
}

export {};
