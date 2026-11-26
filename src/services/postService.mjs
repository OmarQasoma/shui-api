import { randomUUID } from "node:crypto";

import {
  createPost,
  getPostById,
  getAllPosts,
  updatePost,
  markPostForDeletion,
  deletePost,
} from "../repositories/postRepository.mjs";

import { deleteCommentsByPostId } from "../repositories/commentRepository.mjs";

const serviceError = (statusCode, message) =>
  Object.assign(new Error(message), { statusCode });

// Create a registered or guest post

export const createNewPost = async ({ title, content }, user) => {
  const isGuest = !user;

  const username = isGuest
    ? `guest-${randomUUID().slice(0, 8)}`
    : user.username;

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

  return createPost(post);
};

// Retrieve all posts

export const listPosts = async (username) => {
  return getAllPosts(username);
};

// Retrieve a specific post

export const findPost = async (postId) => {
  if (!postId) {
    throw serviceError(404, "Post not found");
  }

  const post = await getPostById(postId);

  if (!post) {
    throw serviceError(404, "Post not found");
  }

  return post;
};

// Update an existing post

export const editPost = async (postId, username, { title, content }) => {
  try {
    return await updatePost(postId, username, title, content);
  } catch (error) {
    if (error.name === "ConditionalCheckFailedException") {
      const currentPost = await getPostById(postId);

      if (!currentPost) {
        throw serviceError(404, "Post not found");
      }

      throw serviceError(403, "You cannot update this post");
    }

    throw error;
  }
};

// Delete a post and all associated comments

export const removePost = async (postId, username) => {
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
        throw serviceError(404, "Post not found");
      }

      if (currentPost.isGuest !== false || currentPost.username !== username) {
        throw serviceError(403, "You cannot delete this post");
      }
    }

    throw error;
  }
};
