import middy from "@middy/core";

import { sendResponse } from "../responses/index.mjs";
import { errorHandler } from "../middlewares/errorHandler.mjs";
import { listComments } from "../services/commentService.mjs";

const getCommentsHandler = async (event) => {
  const comments = await listComments(
    event.pathParameters?.postId
  );

  return sendResponse(200, comments);
};

export const handler = middy(getCommentsHandler)
  .use(errorHandler());