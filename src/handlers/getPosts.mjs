import middy from "@middy/core";
import { z } from "zod";

import { sendResponse, sendError } from "../responses/index.mjs";
import { errorHandler } from "../middlewares/errorHandler.mjs";
import { getAllPosts } from "../repositories/postRepository.mjs";

const querySchema = z.object({
  username: z.string().trim().min(1).max(50).optional(),
}).strict();

const getPostsHandler = async (event) => {
  const result = querySchema.safeParse(
    event.queryStringParameters ?? {}
  );

  if (!result.success) {
    return sendError(400, "Invalid query parameters");
  }

  const { username } = result.data;

  const posts = await getAllPosts(username);

  return sendResponse(200, posts);
};

export const handler = middy(getPostsHandler)
  .use(errorHandler());