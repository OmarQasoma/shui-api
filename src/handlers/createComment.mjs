import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";
import { randomUUID } from "node:crypto";

import { sendResponse, sendError } from "../responses/index.mjs";
import { errorHandler } from "../middlewares/errorHandler.mjs";
import { authMiddleware } from "../middlewares/authMiddleware.mjs";
import { validateBody } from "../middlewares/validateBody.mjs";
import { createCommentSchema } from "../schemas/commentSchema.mjs";
import { getPostById } from "../repositories/postRepository.mjs";
import { createComment } from "../repositories/commentRepository.mjs";

const createCommentHandler = async (event) => {
  const { postId } = event.pathParameters;
  const { content } = event.body;
  const { username } = event.user;

  const post = await getPostById(postId);

  if (!post) {
    return sendError(404, "Post not found");
  }

  const comment = {
    id: randomUUID(),
    postId,
    username,
    content,
    createdAt: new Date().toISOString(),
  };

  try {
  await createComment(comment);
} catch (error) {
  if (error.name === "TransactionCanceledException") {
    const currentPost = await getPostById(postId);

    if (!currentPost) {
      return sendError(404, "Post not found");
    }
  }

  throw error;
}

  return sendResponse(201, {
    message: "Comment created successfully",
    comment,
  });
};

export const handler = middy(createCommentHandler)
  .use(authMiddleware())
  .use(httpJsonBodyParser())
  .use(validateBody(createCommentSchema))
  .use(errorHandler());