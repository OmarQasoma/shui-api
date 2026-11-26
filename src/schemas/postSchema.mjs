import { z } from "zod";

export const createPostSchema = z
  .object({
    title: z.string().trim().min(1).max(100),
    content: z.string().trim().min(1).max(5000),
  })
  .strict();

export const updatePostSchema = createPostSchema;
