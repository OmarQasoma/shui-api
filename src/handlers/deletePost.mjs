import middy from "@middy/core";

import { errorHandler } from "../middlewares/errorHandler.mjs";
import { authMiddleware } from "../middlewares/authMiddleware.mjs";
import { authorizePostOwner } from "../middlewares/authorizePostOwner.mjs";
import { removePost } from "../services/postService.mjs";

const deletePostHandler = async (event) => {
  await removePost(
    event.pathParameters.postId,
    event.user.username
  );

  return {
    statusCode: 204,
  };
};

export const handler = middy(deletePostHandler)
  .use(authMiddleware())
  .use(authorizePostOwner({
    includePending: true,
    forbiddenMessage: "You cannot delete this post",
  }))
  .use(errorHandler());