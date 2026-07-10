import z from "zod";

export const StudentLifeSchema = z.object({
  id: z.string().or(z.number()).optional(),
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  seo_title: z.string().min(1, "SEO Title is required"),
  cover_image: z.string().min(1, "Cover image is required"),
  description: z.string().nullable().optional(),
  content: z.string().min(1, "Content is required"),
  author: z.string().min(1, "Author is required"),
  publish_date: z.string().or(z.date()),
  draft: z.boolean().optional().default(false),
  created_at: z.string().or(z.date()).optional(),
  updated_at: z.string().or(z.date()).optional(),
});

export type StudentLifeType = z.TypeOf<typeof StudentLifeSchema>;

export const CreateStudentLifeBody = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  seo_title: z.string().min(1, "SEO Title is required"),
  cover_image: z.string().min(1, "Cover image is required"),
  description: z.string().nullable().optional(),
  content: z.string().min(1, "Content is required"),
  author: z.string().min(1, "Author is required"),
  publish_date: z.string().or(z.date()),
  draft: z.boolean().optional().default(false),
});

export type CreateStudentLifeType = z.TypeOf<typeof CreateStudentLifeBody>;

export const UpdateStudentLifeBody = CreateStudentLifeBody.partial();

export type UpdateStudentLifeType = z.TypeOf<typeof UpdateStudentLifeBody>;
