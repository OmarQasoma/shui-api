import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import { randomUUID } from "node:crypto";

import { sendResponse } from "../responses/index.mjs";
import { errorHandler } from "../middlewares/errorHandler.mjs";
import { validateBody } from "../middlewares/validateBody.mjs";
import { authMiddleware } from "../middlewares/authMiddleware.mjs";
import { createPostSchema } from "../schemas/postSchema.mjs";
import { createPost } from "../repositories/postRepository.mjs";

const createPostHandler = async (event) => {
  const { title, content } = event.body;

  const isGuest = !event.user;

  const username = isGuest
    ? `guest-${randomUUID().slice(0, 8)}`
    : event.user.username;

  const now = new Date().toISOString();

  const post = {
    id: randomUUID(),
    username,
    isGuest,
    title,
    content,
    createdAt: now,
    updatedAt: now,
  };

  await createPost(post);

  return sendResponse(201, {
    message: "Post created successfully",
    post,
  });
};

export const handler = middy(createPostHandler)
  .use(authMiddleware({ required: false }))
  .use(httpJsonBodyParser())
  .use(validateBody(createPostSchema))
  .use(errorHandler());