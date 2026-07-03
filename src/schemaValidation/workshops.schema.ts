import { z } from "zod";

export const workshopTagSchema = z.enum([
  "DIY",
  "Kỹ năng",
  "Kids",
  "Lễ tết",
  "Cộng đồng",
]);

export const workshopSchema = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1),
  tag: workshopTagSchema,
  date: z.string().min(1),
  time: z.string().min(1),
  slots: z.number().int().nonnegative(),
  slotLeft: z.number().int().nonnegative(),
  location: z.string().min(1),
  price: z.string().min(1),
  description: z.string().min(1),
  image: z.string().url(),
  featured: z.boolean(),
});

export const createWorkshopRegistrationSchema = z.object({
  workshopId: z.number().int().positive(),
  fullName: z.string().min(1),
  phone: z.string().min(6),
  email: z.string().email(),
  participants: z.number().int().positive().default(1),
  note: z.string().optional(),
});

export const workshopIdParamsSchema = z.object({
  id: z.string().min(1),
});

export const listWorkshopsQuerySchema = z.object({
  tag: workshopTagSchema.optional(),
});

export type Workshop = z.infer<typeof workshopSchema>;
export type CreateWorkshopRegistrationInput = z.infer<typeof createWorkshopRegistrationSchema>;
export type ListWorkshopsQuery = z.infer<typeof listWorkshopsQuerySchema>;
