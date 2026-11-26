import middy from "@middy/core";

import { sendError } from "../responses/index.mjs";
import { errorHandler } from "../middlewares/errorHandler.mjs";
import { authMiddleware } from "../middlewares/authMiddleware.mjs";

import {
  getPostById,
  markPostForDeletion,
  deletePost,
} from "../repositories/postRepository.mjs";

import {
  deleteCommentsByPostId,
} from "../repositories/commentRepository.mjs";

const deletePostHandler = async (event) => {
  const { postId } = event.pathParameters;
  const { username } = event.user;

  const post = await getPostById(postId, {
    includePending: true,
  });

  if (!post) {
    return sendError(404, "Post not found");
  }

  if (post.isGuest || post.username !== username) {
    return sendError(403, "You cannot delete this post");
  }

  try {
    await markPostForDeletion(postId, username);

    await deleteCommentsByPostId(postId);

    await deletePost(postId, username);
  } catch (error) {
    if (error.name === "ConditionalCheckFailedException") {
      const currentPost = await getPostById(postId, {
        includePending: true,
      });

      if (!currentPost) {
        return sendError(404, "Post not found");
      }

      if (
        currentPost.isGuest ||
        currentPost.username !== username
      ) {
        return sendError(403, "You cannot delete this post");
      }
    }

    throw error;
  }

  return {
    statusCode: 204,
  };
};

export const handler = middy(deletePostHandler)
  .use(authMiddleware())
  .use(errorHandler());