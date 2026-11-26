import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";

import { sendResponse } from "../responses/index.mjs";
import { errorHandler } from "../middlewares/errorHandler.mjs";
import { validateBody } from "../middlewares/validateBody.mjs";
import { loginSchema } from "../schemas/authSchema.mjs";
import { loginUser } from "../services/authService.mjs";

const loginHandler = async (event) => {
  const result = await loginUser(event.body);

  return sendResponse(200, {
    message: "Login successful",
    ...result,
  });
};

export const handler = middy(loginHandler)
  .use(httpJsonBodyParser())
  .use(validateBody(loginSchema))
  .use(errorHandler());
