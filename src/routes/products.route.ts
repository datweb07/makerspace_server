import { type FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { productsController } from "../controllers/products.controller";
import { createProductSchema, updateProductSchema, listProductsQuerySchema, productIdParamsSchema, type CreateProductInput, type UpdateProductInput, type ListProductsQuery } from "../schemaValidation/products.schema";

const productsRoute: FastifyPluginAsync = async (server) => {
  server.get(
    "/",
    {
      schema: {
        querystring: listProductsQuerySchema,
      },
    },
    async (request) => productsController.listProducts(request.query as ListProductsQuery, (request as any).lang),
  );

  server.get("/categories", async (request) => productsController.listCategories((request as any).lang));

  server.post(
    "/categories",
    {
      schema: {
        body: z.object({ name: z.string().min(1), slug: z.string().optional() }),
      },
    },
    async (request) => {
      const body = request.body as { name: string; slug?: string };
      return productsController.createCategory(body, (request as any).lang);
    }
  );

  server.put(
    "/categories/:id",
    {
      schema: {
        params: productIdParamsSchema,
        body: z.object({ name: z.string().min(1), slug: z.string().optional() }),
      },
    },
    async (request, reply) => {
      const params = request.params as { id: string };
      const body = request.body as { name: string; slug?: string };
      const success = await productsController.updateCategory(Number(params.id), body, (request as any).lang);
      if (!success) {
        return reply.code(404).send({ message: "Category not found" });
      }
      return { message: "Category updated successfully" };
    }
  );

  server.delete(
    "/categories/:id",
    {
      schema: {
        params: productIdParamsSchema,
      },
    },
    async (request, reply) => {
      const params = request.params as { id: string };
      const success = await productsController.deleteCategory(Number(params.id), (request as any).lang);
      if (!success) {
        return reply.code(404).send({ message: "Category not found" });
      }
      return { message: "Category deleted successfully" };
    }
  );

  server.patch(
    "/categories/:id/hide",
    {
      schema: {
        params: productIdParamsSchema,
        body: z.object({ draft: z.boolean() }),
      },
    },
    async (request, reply) => {
      const params = request.params as { id: string };
      const body = request.body as { draft: boolean };
      const success = await productsController.toggleCategoryDraft(Number(params.id), body.draft, (request as any).lang);
      if (!success) {
        return reply.code(404).send({ message: "Category not found" });
      }
      return { message: "Category visibility updated successfully" };
    }
  );

  server.get(
    "/:id",
    {
      schema: {
        params: productIdParamsSchema,
      },
    },
    async (request, reply) => {
      const params = request.params as { id: string };
      const numericId = Number(params.id);
      let product;
      if (isNaN(numericId)) {
        product = await productsController.getProductBySlug(params.id, (request as any).lang);
      } else {
        product = await productsController.getProductById(numericId, (request as any).lang);
      }
      
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
    async (request) => productsController.createProduct(request.body as CreateProductInput, (request as any).lang),
  );

  server.put(
    "/:id",
    {
      schema: {
        params: productIdParamsSchema,
        body: updateProductSchema,
      },
    },
    async (request, reply) => {
      const params = request.params as { id: string };
      const product = await productsController.updateProduct(Number(params.id), request.body as UpdateProductInput, (request as any).lang);
      if (!product) {
        return reply.code(404).send({ message: "Product not found" });
      }
      return product;
    },
  );

  server.delete(
    "/:id",
    {
      schema: {
        params: productIdParamsSchema,
      },
    },
    async (request, reply) => {
      const params = request.params as { id: string };
      const success = await productsController.deleteProduct(Number(params.id), (request as any).lang);
      if (!success) {
        return reply.code(404).send({ message: "Product not found" });
      }
      return { message: "Product deleted successfully" };
    },
  );

  server.patch(
    "/:id/hide",
    {
      schema: {
        params: productIdParamsSchema,
        body: z.object({ draft: z.boolean() }),
      },
    },
    async (request, reply) => {
      const params = request.params as { id: string };
      const body = request.body as { draft: boolean };
      const success = await productsController.toggleItemDraft(Number(params.id), body.draft, (request as any).lang);
      if (!success) {
        return reply.code(404).send({ message: "Product not found" });
      }
      return { message: "Product visibility updated successfully" };
    },
  );
};

export default productsRoute;
