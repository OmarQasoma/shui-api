import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";

import { sendResponse } from "../responses/index.mjs";
import { errorHandler } from "../middlewares/errorHandler.mjs";
import { authMiddleware } from "../middlewares/authMiddleware.mjs";
import { validateBody } from "../middlewares/validateBody.mjs";
import { authorizePostOwner } from "../middlewares/authorizePostOwner.mjs";
import { updatePostSchema } from "../schemas/postSchema.mjs";
import { editPost } from "../services/postService.mjs";

const updatePostHandler = async (event) => {
  const post = await editPost(
    event.pathParameters.postId,
    event.user.username,
    event.body
  );

  return sendResponse(200, {
    message: "Post updated successfully",
    post,
  });
};

export const handler = middy(updatePostHandler)
  .use(authMiddleware())
  .use(httpJsonBodyParser())
  .use(validateBody(updatePostSchema))
  .use(authorizePostOwner({
    forbiddenMessage: "You cannot update this post",
  }))
  .use(errorHandler());