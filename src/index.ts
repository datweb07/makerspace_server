import path from "path";
import fs from "fs";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import fastify, { FastifyRequest, HookHandlerDoneFunction } from "fastify";
import fastifyCookie from "@fastify/cookie";
import fastifySession from "@fastify/session";
import fastifyMultipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import fastifySensible from "@fastify/sensible";

import envConfig from "./config";
import validatorCompilerPlugin from "./plugins/validatorCompiler.plugin";
import productsRoute from "./routes/products.route";
import workshopsRoute from "./routes/workshops.route";
import membersRoute from "./routes/members.route";
import servicesRoute from "./routes/services.route";
import contactsRoute from "./routes/contacts.route";
import utilsRoute from "./routes/utils.route";
import staffRoute from "./routes/staff.route";
import technicalsRoute from "./routes/technicals.route";
import internRoute from "./routes/intern.route";
import userRoute from "./routes/user.route";
import uploadRoutes from "./routes/upload.route";
import newsRoutes from "./routes/news.route";
import studentLifeRoutes from "./routes/student_life.route";
import eventsRoutes from "./routes/events.route";
import diyRoute from "./routes/diy.route";
import shortCoursesRoute from "./routes/short_courses.route";
import careersRoute from "./routes/careers.route";
import searchRoute from "./routes/search.route";
import { DEFAULT_API_PREFIX } from "./constants";
import { closeAllPools } from "./models/db/pool";

(async function main() {
  const server = fastify({ logger: true, routerOptions: { ignoreTrailingSlash: true }, maxParamLength: 1000 });

  // CORS phải được register ĐẦU TIÊN và với await để đảm bảo headers luôn có mặt trước mọi plugin khác
  await server.register(cors, {
    credentials: true,
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);

      try {
        const hostname = new URL(origin).hostname;

        if (hostname === "localhost" || hostname === "127.0.0.1") {
          return cb(null, true);
        }

        if (hostname.endsWith("ueh.edu.vn") || hostname.includes("vercel.app")) {
          return cb(null, true);
        }

        return cb(new Error("Not allowed by CORS"), false);
      } catch {
        return cb(new Error("Invalid origin"), false);
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  });

  const publicPath = path.join(process.cwd(), "public");
  if (!fs.existsSync(publicPath)) {
    fs.mkdirSync(publicPath, { recursive: true });
  }

  await server.register(fastifyStatic, {
    root: publicPath,
    prefix: envConfig.BASE_PATH ? `${envConfig.BASE_PATH}/public/` : "/public/",
  });

  // Rate Limiting — đặt SAU CORS để không chặn OPTIONS preflight request
  await server.register(rateLimit, {
    global: true,
    max: 200,                    // Tối đa 200 req/phút mỗi IP (global)
    timeWindow: "1 minute",
    skipOnError: true,           // Không rate-limit các request đã bị lỗi
    errorResponseBuilder: (_request: any, context: any) => ({
      statusCode: 429,
      message: `Quá nhiều yêu cầu. Vui lòng thử lại sau ${Math.ceil(context.ttl / 1000)} giây.`,
    }),
  });


  server.register(fastifySensible);
  server.register(validatorCompilerPlugin);
  server.register(fastifyCookie);
  server.register(fastifySession, {
    secret: envConfig.SESSION_TOKEN_SECRET,
    cookie: { secure: false },
  });
  server.register(fastifyMultipart, {
    limits: {
      fileSize: 20_000_000,
      files: 10,
    },
  });

  // Bỏ qua rate-limit cho OPTIONS preflight (CORS) — phải đặt TRƯỚC preValidation
  server.addHook("onRequest", (request, reply, done) => {
    if (request.method === "OPTIONS") {
      reply.header("x-ratelimit-limit", "999999");
      (request as any).isPreflightRequest = true;
    }
    done();
  });

  server.addHook(
    "preValidation",
    (
      request: FastifyRequest<{
        Querystring: { lang?: LangType };
      }>,
      _reply: unknown,
      done: HookHandlerDoneFunction,
    ) => {
      request.lang = request.query.lang ?? "vi";
      done();
    },
  );

  server.get("/", async () => ({
    ok: true,
    message: "Welcome to MakerSpace API Server",
  }));

  server.get("/makerspace_server", async () => ({
    ok: true,
    message: "Welcome to MakerSpace API Server",
  }));

  server.get("/makerspace_server/ping", async () => ({
    ok: true,
    message: "pong - v2 with trailing slash fix",
  }));

  server.get("/health", async () => ({
    ok: true,
    service: "makerspace_server",
  }));


  server.addHook("onSend", (request, reply, payload: any, done) => {
    if (typeof payload === "string" && payload.includes('"public/static/images/')) {
      const basePath = envConfig.BASE_PATH ? envConfig.BASE_PATH : "";
      const newPayload = payload.replace(
        /"public\/static\/images\//g,
        `"${envConfig.SERVER_PROTOCOL}://${envConfig.SERVER_DOMAIN}${basePath}/public/static/images/`
      );
      done(null, newPayload);
    } else {
      done(null, payload);
    }
  });

  server.register(utilsRoute, { prefix: `${DEFAULT_API_PREFIX}/utils` });
  server.register(productsRoute, { prefix: `${DEFAULT_API_PREFIX}/products` });
  server.register(workshopsRoute, { prefix: `${DEFAULT_API_PREFIX}/workshops` });
  server.register(membersRoute, { prefix: `${DEFAULT_API_PREFIX}/members` });
  server.register(servicesRoute, { prefix: `${DEFAULT_API_PREFIX}/services` });
  server.register(contactsRoute, { prefix: `${DEFAULT_API_PREFIX}/contacts` });
  server.register(staffRoute, { prefix: `${DEFAULT_API_PREFIX}/people/staff` });
  server.register(technicalsRoute, { prefix: `${DEFAULT_API_PREFIX}/people/technicals` });
  server.register(internRoute, { prefix: `${DEFAULT_API_PREFIX}/people/intern` });
  server.register(userRoute, { prefix: `${DEFAULT_API_PREFIX}/users` });
  server.register(uploadRoutes, { prefix: `${DEFAULT_API_PREFIX}/upload` });
  server.register(newsRoutes, { prefix: `${DEFAULT_API_PREFIX}/posts/news` });
  server.register(studentLifeRoutes, { prefix: `${DEFAULT_API_PREFIX}/posts/student_life` });
  server.register(eventsRoutes, { prefix: `${DEFAULT_API_PREFIX}/posts/events` });
  server.register(diyRoute, { prefix: `${DEFAULT_API_PREFIX}/workshops/diy` });
  server.register(shortCoursesRoute, { prefix: `${DEFAULT_API_PREFIX}/workshops/short_courses` });
  server.register(careersRoute, { prefix: `${DEFAULT_API_PREFIX}/posts/careers` });
  server.register(searchRoute, { prefix: `${DEFAULT_API_PREFIX}/search` });

  try {
    await server.listen({
      port: Number(envConfig.PORT),
      host: "0.0.0.0",
    });

    server.log.info(`Server ready at ${envConfig.PORT}`);
  } catch (error) {
    server.log.error(error);
    process.exit(1);
  }

  // Graceful Shutdown — tránh orphan process và connection leak trên cPanel
  const gracefulShutdown = async (signal: string) => {
    server.log.info(`Received ${signal}, shutting down gracefully...`);
    try {
      await server.close();
      await closeAllPools();
      server.log.info("Server closed. All DB connections released.");
    } catch (err) {
      server.log.error(err, "Error during shutdown");
    } finally {
      process.exit(0);
    }
  };

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
})();