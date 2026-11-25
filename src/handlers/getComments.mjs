import middy from "@middy/core";

import { sendResponse, sendError } from "../responses/index.mjs";
import { errorHandler } from "../middlewares/errorHandler.mjs";
import { getPostById } from "../repositories/postRepository.mjs";
import { getCommentsByPostId } from "../repositories/commentRepository.mjs";

const getCommentsHandler = async (event) => {
  const { postId } = event.pathParameters;

  const post = await getPostById(postId);

  if (!post) {
    return sendError(404, "Post not found");
  }

  const comments = await getCommentsByPostId(postId);

  return sendResponse(200, comments);
};

export const handler = middy(getCommentsHandler)
  .use(errorHandler());