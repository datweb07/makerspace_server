import z from "zod";

export const StaffSchema = z.object({
  id: z.string().or(z.number()).optional(),
  name: z.string().min(1, "Name is required"),
  title: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  phone: z.string().nullable().optional(),
  cover_image: z.string().min(1, "Cover image is required"),
  display_order: z.number().int().optional().default(0),
  draft: z.boolean().optional().default(false),
});

export type StaffType = z.TypeOf<typeof StaffSchema>;

export const CreateStaffBody = z.object({
  id: z.string().min(1, "ID/Slug is required"),
  name: z.string().min(1, "Name is required"),
  title: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  email: z.string().email("Invalid email").nullable().optional().or(z.literal("")),
  phone: z.string().nullable().optional(),
  cover_image: z.string().min(1, "Cover image is required"),
  display_order: z.number().int().optional().default(0),
  draft: z.boolean().optional().default(false),
});

export type CreateStaffType = z.TypeOf<typeof CreateStaffBody>;

export const UpdateStaffBody = z.object({
  name: z.string().min(1, "Name is required").optional(),
  title: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  email: z.string().email("Invalid email").nullable().optional().or(z.literal("")),
  phone: z.string().nullable().optional(),
  cover_image: z.string().min(1, "Cover image is required").optional(),
  display_order: z.number().int().optional(),
  draft: z.boolean().optional(),
});

export type UpdateStaffType = z.TypeOf<typeof UpdateStaffBody>;
