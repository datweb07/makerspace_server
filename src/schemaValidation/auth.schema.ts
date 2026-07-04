import z from "zod";

export const UserSchema = z.object({
  id: z.string(),
  username: z.string().min(3),
  role: z.string(),
  status: z.string(),
});

export type UserType = z.TypeOf<typeof UserSchema>;

export const LoginBody = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
});
export type LoginBodyType = z.TypeOf<typeof LoginBody>;

export const LoginRes = z.object({
  data: z.object({
    token: z.string(),
    expires: z.string(),
  }),
  message: z.string(),
});
export type LoginResType = z.TypeOf<typeof LoginRes>;
