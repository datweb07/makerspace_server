import z from "zod";

export const NewsSchema = z.object({
  id: z.string().or(z.number()).optional(),
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  cover_image: z.string().min(1, "Cover image is required").transform(val => {
    if (!val) return val;
    const match = val.match(/^https?:\/\/[^\/]+\/(public\/static\/images\/.*)$/);
    return match ? match[1] : val;
  }),
  description: z.string().nullable().optional(),
  content: z.string().min(1, "Content is required"),
  author: z.string().min(1, "Author is required"),
  publish_date: z.string().or(z.date()),
  draft: z.boolean().optional().default(false),
  created_at: z.string().or(z.date()).optional(),
  updated_at: z.string().or(z.date()).optional(),
});

export type NewsType = z.TypeOf<typeof NewsSchema>;

export const CreateNewsBody = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  cover_image: z.string().min(1, "Cover image is required").transform(val => {
    if (!val) return val;
    const match = val.match(/^https?:\/\/[^\/]+\/(public\/static\/images\/.*)$/);
    return match ? match[1] : val;
  }),
  description: z.string().nullable().optional(),
  content: z.string().min(1, "Content is required"),
  author: z.string().min(1, "Author is required"),
  publish_date: z.string().or(z.date()),
  draft: z.boolean().optional().default(false),
});

export type CreateNewsType = z.TypeOf<typeof CreateNewsBody>;

export const UpdateNewsBody = CreateNewsBody.partial();

export type UpdateNewsType = z.TypeOf<typeof UpdateNewsBody>;
