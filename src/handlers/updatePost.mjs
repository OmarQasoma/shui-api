import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";

import { sendResponse, sendError } from "../responses/index.mjs";
import { errorHandler } from "../middlewares/errorHandler.mjs";
import { authMiddleware } from "../middlewares/authMiddleware.mjs";
import { validateBody } from "../middlewares/validateBody.mjs";
import { updatePostSchema } from "../schemas/postSchema.mjs";
import {
  getPostById,
  updatePost,
} from "../repositories/postRepository.mjs";

const updatePostHandler = async (event) => {
  const { postId } = event.pathParameters;
  const { title, content } = event.body;
  const { username } = event.user;

  const post = await getPostById(postId);

  if (!post) {
    return sendError(404, "Post not found");
  }

  if (post.isGuest || post.username !== username) {
    return sendError(403, "You cannot update this post");
  }

  let updatedPost;

  try {
    updatedPost = await updatePost(
      postId,
      username,
      title,
      content
    );
  } catch (error) {
    if (error.name === "ConditionalCheckFailedException") {
      const currentPost = await getPostById(postId);

      if (!currentPost) {
        return sendError(404, "Post not found");
      }

      return sendError(403, "You cannot update this post");
    }

    throw error;
  }

  return sendResponse(200, {
    message: "Post updated successfully",
    post: updatedPost,
  });
};

export const handler = middy(updatePostHandler)
  .use(authMiddleware())
  .use(httpJsonBodyParser())
  .use(validateBody(updatePostSchema))
  .use(errorHandler());