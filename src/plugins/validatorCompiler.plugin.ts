import fp from "fastify-plugin";
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { type FastifyPluginAsync } from "fastify";

const validatorCompilerPlugin: FastifyPluginAsync = async (server) => {
  server.setValidatorCompiler(validatorCompiler);
  server.setSerializerCompiler(serializerCompiler);
};

export default fp(validatorCompilerPlugin);
