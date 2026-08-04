import { z } from "zod";

export const createDiySchema = z.object({
  title: z.string().min(1, "Vui lòng nhập tiêu đề"),
  slug: z.string().min(1, "Vui lòng nhập slug"),
  cover_image: z.string().min(1, "Ảnh bìa không hợp lệ").optional().or(z.literal("")).transform(val => {
    if (!val) return val;
    const match = val.match(/^https?:\/\/[^\/]+\/(public\/static\/images\/.*)$/);
    return match ? match[1] : val;
  }),
  content: z.string().optional(),
  difficulty: z.string().optional(),
  draft: z.boolean().optional().default(false),
  start_time: z.string().nullable().optional(),
  end_time: z.string().nullable().optional(),
  location: z.string().optional(),
  max_participants: z.coerce.number().optional(),
});

export const updateDiySchema = createDiySchema.partial();
export type CreateDiyType = z.infer<typeof createDiySchema>;
export type UpdateDiyType = z.infer<typeof updateDiySchema>;

export const createShortCourseSchema = z.object({
  title: z.string().min(1, "Vui lòng nhập tiêu đề"),
  slug: z.string().min(1, "Vui lòng nhập slug"),
  cover_image: z.string().min(1, "Ảnh bìa không hợp lệ").optional().or(z.literal("")).transform(val => {
    if (!val) return val;
    const match = val.match(/^https?:\/\/[^\/]+\/(public\/static\/images\/.*)$/);
    return match ? match[1] : val;
  }),
  content: z.string().optional(),
  duration: z.string().optional(),
  price: z.number().nonnegative("Giá không hợp lệ").optional(),
  location: z.string().optional(),
  language: z.string().optional(),
  level: z.string().optional(),
  experience_requirements: z.string().optional(),
  objectives: z.string().optional(),
  structure: z.any().optional(),
  offer_by: z.any().optional(),
  summarize: z.any().optional(),
  draft: z.boolean().optional().default(false),
  start_time: z.string().nullable().optional(),
  end_time: z.string().nullable().optional(),
  schedule_details: z.string().optional(),
  max_participants: z.coerce.number().nullable().optional(),
  type: z.string().optional(),
  status: z.string().optional(),
});

export const updateShortCourseSchema = createShortCourseSchema.partial();
export type CreateShortCourseType = z.infer<typeof createShortCourseSchema>;
export type UpdateShortCourseType = z.infer<typeof updateShortCourseSchema>;

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
  workshop_id: z.string().min(1),
  workshop_type: z.string().min(1),
  name: z.string().min(1, "Vui lòng nhập họ tên"),
  phone: z.string().min(1, "Vui lòng nhập số điện thoại"),
  email: z.string().email("Email không hợp lệ"),
  participants: z.coerce.number().min(1),
  note: z.string().optional(),
});
export type CreateWorkshopRegistrationInput = z.infer<typeof createWorkshopRegistrationSchema>;

export const updateBookingStatusSchema = z.object({
  status: z.enum(["pending", "approved", "cancelled"]),
});
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;
