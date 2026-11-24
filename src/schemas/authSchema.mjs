import { z } from "zod";

export const registerSchema = z.object({
  username: z.string().trim().min(3).max(50),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  username: z.string().trim().min(1).max(50),
  password: z.string().min(1).max(128),
});