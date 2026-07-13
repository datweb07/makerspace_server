import z from "zod";

export const EventsSchema = z.object({
  id: z.string().or(z.number()).optional(),
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  seo_title: z.string().min(1, "SEO Title is required"),
  cover_image: z.string().min(1, "Cover image is required").transform(val => {
    if (!val) return val;
    const match = val.match(/^https?:\/\/[^\/]+\/(public\/static\/images\/.*)$/);
    return match ? match[1] : val;
  }),
  description: z.string().nullable().optional(),
  content: z.string().min(1, "Content is required"),
  author: z.string().min(1, "Author is required"),
  publish_date: z.string().or(z.date()),
  event_time: z.string().or(z.date()).optional().nullable(),
  draft: z.boolean().optional().default(false),
  created_at: z.string().or(z.date()).optional(),
  updated_at: z.string().or(z.date()).optional(),
});

export type EventsType = z.TypeOf<typeof EventsSchema>;

export const CreateEventsBody = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  seo_title: z.string().min(1, "SEO Title is required"),
  cover_image: z.string().min(1, "Cover image is required").transform(val => {
    if (!val) return val;
    const match = val.match(/^https?:\/\/[^\/]+\/(public\/static\/images\/.*)$/);
    return match ? match[1] : val;
  }),
  description: z.string().nullable().optional(),
  content: z.string().min(1, "Content is required"),
  author: z.string().min(1, "Author is required"),
  publish_date: z.string().or(z.date()),
  event_time: z.string().or(z.date()).optional().nullable(),
  draft: z.boolean().optional().default(false),
});

export type CreateEventsType = z.TypeOf<typeof CreateEventsBody>;

export const UpdateEventsBody = CreateEventsBody.partial();

export type UpdateEventsType = z.TypeOf<typeof UpdateEventsBody>;
