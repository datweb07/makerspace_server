import { z } from "zod";

export const contactInquirySchema = z.object({
  companyName: z.string().min(1),
  contactName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(6),
  requestKinds: z.array(z.string().min(1)).optional(),
  detail: z.string().min(1),
});

export type ContactInquiryInput = z.infer<typeof contactInquirySchema>;
