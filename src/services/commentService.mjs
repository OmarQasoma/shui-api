import { randomUUID } from "node:crypto";

import { getPostById } from "../repositories/postRepository.mjs";

import {
  createComment,
  getCommentsByPostId,
} from "../repositories/commentRepository.mjs";

const serviceError = (statusCode, message) =>
  Object.assign(new Error(message), { statusCode });

const ensurePostExists = async (postId) => {
  if (!postId) {
    throw serviceError(404, "Post not found");
  }

  const post = await getPostById(postId);

  if (!post) {
    throw serviceError(404, "Post not found");
  }

  return post;
};


// Create a comment

export const createNewComment = async (
  postId,
  username,
  { content }
) => {
  await ensurePostExists(postId);

  const comment = {
    id: randomUUID(),
    postId,
    username,
    content,
    createdAt: new Date().toISOString(),
  };

  try {
    return await createComment(comment);
  } catch (error) {
    if (error.name === "TransactionCanceledException") {
      await ensurePostExists(postId);
    }

    throw error;
  }
};


// Retrieve comments

export const listComments = async (postId) => {
  await ensurePostExists(postId);

  return getCommentsByPostId(postId);
};