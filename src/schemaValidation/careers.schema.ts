import { z } from "zod";

export const CreateCareersSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  slug: z.string().min(1, "Slug is required").max(255),
  deadline: z.string().min(1, "Deadline is required").max(100),
  status: z.enum(["open", "closed"]).default("open"),
  content: z.string().optional().nullable(),
  publish_date: z.coerce.date().optional(),
  draft: z.boolean().optional(),
});

export const UpdateCareersSchema = CreateCareersSchema.partial();

export type CreateCareersType = z.infer<typeof CreateCareersSchema>;
export type UpdateCareersType = z.infer<typeof UpdateCareersSchema>;
