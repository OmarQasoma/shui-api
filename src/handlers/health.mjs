import middy from "@middy/core";
import { sendResponse } from "../responses/index.mjs";
import { errorHandler } from "../middlewares/errorHandler.mjs";

const healthHandler = async () => {
  return sendResponse(200, {
    message: "Shui API is running",
  });
};

export const handler = middy(healthHandler)
  .use(errorHandler());