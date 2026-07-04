import z from "zod";

export const InternSchema = z.object({
  id: z.string().or(z.number()).optional(),
  name: z.string().min(1, "Name is required"),
  university: z.string().nullable().optional(),
  major: z.string().nullable().optional(),
  period: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  cover_image: z.string().min(1, "Cover image is required"),
  display_order: z.number().int().optional().default(0),
  created_at: z.string().or(z.date()).optional(),
  updated_at: z.string().or(z.date()).optional(),
});

export type InternType = z.TypeOf<typeof InternSchema>;

export const CreateInternBody = z.object({
  id: z.string().min(1, "ID/Slug is required"),
  name: z.string().min(1, "Name is required"),
  university: z.string().nullable().optional(),
  major: z.string().nullable().optional(),
  period: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  cover_image: z.string().min(1, "Cover image is required"),
  display_order: z.number().int().optional().default(0),
});

export type CreateInternType = z.TypeOf<typeof CreateInternBody>;

export const UpdateInternBody = z.object({
  name: z.string().min(1, "Name is required").optional(),
  university: z.string().nullable().optional(),
  major: z.string().nullable().optional(),
  period: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  cover_image: z.string().min(1, "Cover image is required").optional(),
  display_order: z.number().int().optional(),
});

export type UpdateInternType = z.TypeOf<typeof UpdateInternBody>;
