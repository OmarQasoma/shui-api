import { getPostById } from "../repositories/postRepository.mjs";
import { sendError } from "../responses/index.mjs";

export const authorizePostOwner = ({
  includePending = false,
  forbiddenMessage = "You cannot modify this post",
} = {}) => ({
  before: async (request) => {
    const { event } = request;

    if (!event.user?.username) {
      return sendError(401, "Authentication required");
    }

    const postId = event.pathParameters?.postId;

    if (!postId) {
      return sendError(404, "Post not found");
    }

    const post = await getPostById(postId, {
      includePending,
    });

    if (!post) {
      return sendError(404, "Post not found");
    }

    if (
      post.isGuest !== false ||
      post.username !== event.user.username
    ) {
      return sendError(403, forbiddenMessage);
    }

    event.post = post;
  },
});