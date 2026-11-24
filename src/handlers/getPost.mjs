import middy from "@middy/core";

import { sendResponse, sendError } from "../responses/index.mjs";
import { errorHandler } from "../middlewares/errorHandler.mjs";
import { getPostById } from "../repositories/postRepository.mjs";

const getPostHandler = async (event) => {
  const { postId } = event.pathParameters ?? {};

  const post = await getPostById(postId);

  if (!post) {
    return sendError(404, "Post not found");
  }

  return sendResponse(200, post);
};

export const handler = middy(getPostHandler)
  .use(errorHandler());