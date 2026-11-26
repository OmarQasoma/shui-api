import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().trim().min(3).max(50),

  password: z
    .string()
    .min(8)
    .max(128)
    .refine((password) => Buffer.byteLength(password, "utf8") <= 72, {
      message: "Password must not exceed 72 bytes",
    }),
});

export const loginSchema = z.object({
  username: z.string().trim().min(1).max(50),
  password: z.string().min(1).max(128),
});
