import middy from "@middy/core";
import { z } from "zod";

import { sendResponse } from "../responses/index.mjs";
import { errorHandler } from "../middlewares/errorHandler.mjs";
import { validateQuery } from "../middlewares/validateQuery.mjs";
import { listPosts } from "../services/postService.mjs";

const querySchema = z
  .object({
    username: z.string().trim().min(1).max(50).optional(),
  })
  .strict();

const getPostsHandler = async (event) => {
  const { username } = event.queryStringParameters;

  const posts = await listPosts(username);

  return sendResponse(200, posts);
};

export const handler = middy(getPostsHandler)
  .use(validateQuery(querySchema))
  .use(errorHandler());
