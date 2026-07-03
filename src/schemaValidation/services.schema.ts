import { z } from "zod";

export const serviceModelSchema = z.enum(["B2B", "B2C", "Đào tạo"]);

export const serviceCatalogSchema = z.object({
  model: serviceModelSchema,
  title: z.string().min(1),
  description: z.string().min(1),
  features: z.array(z.string().min(1)),
  cta: z.string().min(1),
  ctaPath: z.string().min(1),
  bg: z.string().min(1),
  fg: z.string().min(1),
});

export const serviceQuoteRequestSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(6),
  companyName: z.string().optional(),
  requestType: z.array(z.string().min(1)).optional(),
  description: z.string().min(1),
});

export type ServiceCatalogItem = z.infer<typeof serviceCatalogSchema>;
export type ServiceQuoteRequestInput = z.infer<typeof serviceQuoteRequestSchema>;
