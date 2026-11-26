import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";

import { sendResponse } from "../responses/index.mjs";
import { errorHandler } from "../middlewares/errorHandler.mjs";
import { authMiddleware } from "../middlewares/authMiddleware.mjs";
import { validateBody } from "../middlewares/validateBody.mjs";
import { createCommentSchema } from "../schemas/commentSchema.mjs";
import { createNewComment } from "../services/commentService.mjs";

const createCommentHandler = async (event) => {
  const comment = await createNewComment(
    event.pathParameters?.postId,
    event.user.username,
    event.body,
  );

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
