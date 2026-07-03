import { z } from "zod";

export const memberRegistrationTypeSchema = z.enum([
  "student",
  "workshop",
  "booking",
]);

export const memberRegistrationSchema = z.object({
  type: memberRegistrationTypeSchema,
  fullName: z.string().min(1),
  phone: z.string().min(6),
  email: z.string().email(),
  studentId: z.string().optional(),
  department: z.string().optional(),
  club: z.string().optional(),
  reason: z.string().optional(),
  workshopId: z.number().int().positive().optional(),
  practiceDate: z.string().optional(),
  equipment: z.array(z.string()).optional(),
  note: z.string().optional(),
});

export type MemberRegistrationInput = z.infer<typeof memberRegistrationSchema>;
