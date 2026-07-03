import { type FastifyPluginAsync } from "fastify";
import { productsController } from "../controllers/products.controller";
import { createProductSchema, listProductsQuerySchema, productIdParamsSchema, type CreateProductInput, type ListProductsQuery } from "../schemaValidation/products.schema";

const productsRoute: FastifyPluginAsync = async (server) => {
  server.get(
    "/",
    {
      schema: {
        querystring: listProductsQuerySchema,
      },
    },
    async (request) => productsController.listProducts(request.query as ListProductsQuery),
  );

  server.get("/categories", async () => productsController.listCategories());

  server.get(
    "/:id",
    {
      schema: {
        params: productIdParamsSchema,
      },
    },
    async (request, reply) => {
      const params = request.params as { id: string };
      const product = productsController.getProductById(Number(params.id));
      if (!product) {
        return reply.code(404).send({ message: "Product not found" });
      }

      return product;
    },
  );

  server.post(
    "/",
    {
      schema: {
        body: createProductSchema,
      },
    },
    async (request) => productsController.createProduct(request.body as CreateProductInput),
  );
};

export default productsRoute;
