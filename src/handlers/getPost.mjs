import middy from "@middy/core";

import { sendResponse } from "../responses/index.mjs";
import { errorHandler } from "../middlewares/errorHandler.mjs";
import { findPost } from "../services/postService.mjs";

const getPostHandler = async (event) => {
  const post = await findPost(event.pathParameters?.postId);

  return sendResponse(200, post);
};

export const handler = middy(getPostHandler).use(errorHandler());
