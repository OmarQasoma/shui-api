import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";

import { sendResponse } from "../responses/index.mjs";
import { errorHandler } from "../middlewares/errorHandler.mjs";
import { validateBody } from "../middlewares/validateBody.mjs";
import { authMiddleware } from "../middlewares/authMiddleware.mjs";
import { createPostSchema } from "../schemas/postSchema.mjs";
import { createNewPost } from "../services/postService.mjs";

const createPostHandler = async (event) => {
  const post = await createNewPost(event.body, event.user);

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