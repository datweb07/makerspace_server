import { z } from "zod";

export const productCategorySchema = z.string();

export const productSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  category: productCategorySchema,
  material: z.string().min(1),
  price: z.string().min(1),
  description: z.string().min(1),
  image: z.string().url().transform(val => {
    if (!val) return val;
    const match = val.match(/^https?:\/\/[^\/]+\/(public\/static\/images\/.*)$/);
    return match ? match[1] : val;
  }),
  slug: z.string().optional(),
});

export const createProductSchema = productSchema.omit({ id: true });
export const updateProductSchema = createProductSchema;

export const listProductsQuerySchema = z.object({
  category: productCategorySchema.optional(),
});

export const productIdParamsSchema = z.object({
  id: z.string().min(1),
});

export type Product = z.infer<typeof productSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
