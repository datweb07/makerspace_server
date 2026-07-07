import { z } from "zod";

// --- DIY Workshops ---
export const createDiySchema = z.object({
  title: z.string().min(1, "Vui lòng nhập tiêu đề"),
  slug: z.string().min(1, "Vui lòng nhập slug"),
  cover_image: z.string().min(1, "Ảnh bìa không hợp lệ").optional().or(z.literal("")),
  description: z.string().optional(),
  content: z.string().optional(),
  duration: z.string().optional(),
  difficulty: z.string().optional(),
  draft: z.boolean().optional().default(false),
});

export const updateDiySchema = createDiySchema.partial();
export type CreateDiyType = z.infer<typeof createDiySchema>;
export type UpdateDiyType = z.infer<typeof updateDiySchema>;

// --- Short Courses ---
export const createShortCourseSchema = z.object({
  title: z.string().min(1, "Vui lòng nhập tiêu đề"),
  slug: z.string().min(1, "Vui lòng nhập slug"),
  cover_image: z.string().min(1, "Ảnh bìa không hợp lệ").optional().or(z.literal("")),
  description: z.string().optional(),
  content: z.string().optional(),
  duration: z.string().optional(),
  price: z.number().nonnegative("Giá không hợp lệ").optional(),
  draft: z.boolean().optional().default(false),
});

export const updateShortCourseSchema = createShortCourseSchema.partial();
export type CreateShortCourseType = z.infer<typeof createShortCourseSchema>;
export type UpdateShortCourseType = z.infer<typeof updateShortCourseSchema>;

// --- Workshop Schedules ---
export const workshopTypeSchema = z.enum(["diy", "short_course"]);

export const createScheduleSchema = z.object({
  workshop_type: workshopTypeSchema,
  workshop_id: z.number().int().positive("Workshop ID không hợp lệ"),
  start_time: z.string().datetime({ offset: true }),
  end_time: z.string().datetime({ offset: true }),
  location: z.string().min(1, "Vui lòng nhập địa điểm"),
  max_participants: z.number().int().positive("Số người tham gia không hợp lệ"),
  draft: z.boolean().optional().default(false),
});

export const updateScheduleSchema = createScheduleSchema.partial();
export type CreateScheduleType = z.infer<typeof createScheduleSchema>;
export type UpdateScheduleType = z.infer<typeof updateScheduleSchema>;

export const scheduleIdParamsSchema = z.object({
  id: z.string().min(1),
});

// --- Legacy Workshop & Registrations ---
export const workshopIdParamsSchema = z.object({
  id: z.string().min(1),
});

export const listWorkshopsQuerySchema = z.object({
  limit: z.coerce.number().optional(),
  page: z.coerce.number().optional(),
  tag: z.string().optional(),
});
export type ListWorkshopsQuery = z.infer<typeof listWorkshopsQuerySchema>;

export type Workshop = {
  id: number;
  title: string;
  tag: string;
  date: string;
  time: string;
  slots: number;
  slotLeft: number;
  location: string;
  price: string;
  description: string;
  image: string;
  featured: boolean;
};

export const createWorkshopRegistrationSchema = z.object({
  workshopId: z.number(),
  fullName: z.string(),
  phone: z.string(),
  email: z.string().email(),
  participants: z.number(),
  note: z.string().optional(),
});
export type CreateWorkshopRegistrationInput = z.infer<typeof createWorkshopRegistrationSchema>;
