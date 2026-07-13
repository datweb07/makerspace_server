import z from "zod";

export const InternSchema = z.object({
  id: z.string().or(z.number()).optional(),
  name: z.string().min(1, "Name is required"),
  title: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  cover_image: z.string().min(1, "Cover image is required").transform(val => {
    if (!val) return val;
    const match = val.match(/^https?:\/\/[^\/]+\/(public\/static\/images\/.*)$/);
    return match ? match[1] : val;
  }),
  display_order: z.number().int().optional().default(0),
  draft: z.boolean().optional().default(false),
});

export type InternType = z.TypeOf<typeof InternSchema>;

export const CreateInternBody = z.object({
  id: z.string().min(1, "ID/Slug is required"),
  name: z.string().min(1, "Name is required"),
  title: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  cover_image: z.string().min(1, "Cover image is required").transform(val => {
    if (!val) return val;
    const match = val.match(/^https?:\/\/[^\/]+\/(public\/static\/images\/.*)$/);
    return match ? match[1] : val;
  }),
  display_order: z.number().int().optional().default(0),
  draft: z.boolean().optional().default(false),
});

export type CreateInternType = z.TypeOf<typeof CreateInternBody>;

export const UpdateInternBody = z.object({
  name: z.string().min(1, "Name is required").optional(),
  title: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  cover_image: z.string().min(1, "Cover image is required").optional().transform(val => {
    if (!val) return val;
    const match = val.match(/^https?:\/\/[^\/]+\/(public\/static\/images\/.*)$/);
    return match ? match[1] : val;
  }),
  display_order: z.number().int().optional(),
  draft: z.boolean().optional(),
});

export type UpdateInternType = z.TypeOf<typeof UpdateInternBody>;
