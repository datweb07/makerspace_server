import { z } from "zod";

export const productCategorySchema = z.enum([
  "Bản đồ & Nghệ thuật",
  "Trò chơi & Giải trí",
  "Đèn & Decor",
  "Quà tặng Doanh nghiệp",
  "Signage",
]);

export const productSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  category: productCategorySchema,
  material: z.string().min(1),
  price: z.string().min(1),
  description: z.string().min(1),
  image: z.string().url(),
});

export const createProductSchema = productSchema.omit({ id: true });

export const listProductsQuerySchema = z.object({
  category: productCategorySchema.optional(),
});

export const productIdParamsSchema = z.object({
  id: z.string().min(1),
});

export type Product = z.infer<typeof productSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
