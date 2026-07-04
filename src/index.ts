import path from "path";
import fs from "fs"; 
import cors from "@fastify/cors";
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
import internRoute from "./routes/intern.route";
import userRoute from "./routes/user.route";
import uploadRoutes from "./routes/upload.route";
import newsRoutes from "./routes/news.route";
import eventsRoutes from "./routes/events.route";
import projectsRoutes from "./routes/projects.route";
import { DEFAULT_API_PREFIX } from "./constants";

(async function main() {
  const server = fastify({ logger: true, maxParamLength: 1000 });

  server.register(cors, {
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

  server.register(fastifyStatic, {
    root: publicPath,
    prefix: "/public/",
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

  server.addHook(
    "preHandler",
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

  server.get("/health", async () => ({
    ok: true,
    service: "makerspace_server",
  }));


  server.register(utilsRoute, { prefix: `${DEFAULT_API_PREFIX}/utils` });
  server.register(productsRoute, { prefix: `${DEFAULT_API_PREFIX}/products` });
  server.register(workshopsRoute, { prefix: `${DEFAULT_API_PREFIX}/workshops` });
  server.register(membersRoute, { prefix: `${DEFAULT_API_PREFIX}/members` });
  server.register(servicesRoute, { prefix: `${DEFAULT_API_PREFIX}/services` });
  server.register(contactsRoute, { prefix: `${DEFAULT_API_PREFIX}/contacts` });
  server.register(staffRoute, { prefix: `${DEFAULT_API_PREFIX}/people/staff` });
  server.register(internRoute, { prefix: `${DEFAULT_API_PREFIX}/people/intern` });
  server.register(userRoute, { prefix: `${DEFAULT_API_PREFIX}/users` });
  server.register(uploadRoutes, { prefix: `${DEFAULT_API_PREFIX}/upload` });
  server.register(newsRoutes, { prefix: `${DEFAULT_API_PREFIX}/posts/news` });
  server.register(eventsRoutes, { prefix: `${DEFAULT_API_PREFIX}/posts/events` });
  server.register(projectsRoutes, { prefix: `${DEFAULT_API_PREFIX}/posts/projects` });
  
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
})();