import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";

import { sendResponse } from "../responses/index.mjs";
import { errorHandler } from "../middlewares/errorHandler.mjs";
import { validateBody } from "../middlewares/validateBody.mjs";
import { registerSchema } from "../schemas/authSchema.mjs";
import { registerUser } from "../services/authService.mjs";

const registerHandler = async (event) => {
  const result = await registerUser(event.body);

  return sendResponse(201, {
    message: "User registered successfully",
    ...result,
  });
};

export const handler = middy(registerHandler)
  .use(httpJsonBodyParser())
  .use(validateBody(registerSchema))
  .use(errorHandler());
