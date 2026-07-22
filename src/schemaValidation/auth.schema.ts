import z from "zod";

export const UserSchema = z.object({
  id: z.string(),
  username: z.string().min(3),
  role: z.string(),
  status: z.string(),
});

export type UserType = z.TypeOf<typeof UserSchema>;

export const LoginBody = z.object({
  username: z.string().min(3, "Tên đăng nhập ít nhất 3 ký tự"),
  password: z.string().optional(),
  auth_provider: z.string().optional(),
});
export type LoginBodyType = z.TypeOf<typeof LoginBody>;

export const RegisterBody = z.object({
  username: z.string().email("Email không hợp lệ").min(3, "Tên đăng nhập ít nhất 3 ký tự"),
  password: z.string().optional(),
  auth_provider: z.string().optional(),
});
export type RegisterBodyType = z.TypeOf<typeof RegisterBody>;

export const LoginRes = z.object({
  data: z.object({
    token: z.string(),
    expires: z.string(),
  }),
  message: z.string(),
});
export type LoginResType = z.TypeOf<typeof LoginRes>;
