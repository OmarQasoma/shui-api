import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";

import { sendResponse, sendError } from "../responses/index.mjs";
import { errorHandler } from "../middlewares/errorHandler.mjs";
import { validateBody } from "../middlewares/validateBody.mjs";
import { registerSchema } from "../schemas/authSchema.mjs";
import { createUser } from "../repositories/userRepository.mjs";
import { hashPassword } from "../utils/password.mjs";

const registerHandler = async (event) => {
  const { username, password } = event.body;

  const passwordHash = await hashPassword(password);

  try {
    await createUser({
      username,
      passwordHash,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    if (error.name === "ConditionalCheckFailedException") {
      return sendError(409, "Username already registered");
    }

    throw error;
  }

  return sendResponse(201, {
    message: "User registered successfully",
    username,
  });
};

export const handler = middy(registerHandler)
  .use(httpJsonBodyParser())
  .use(validateBody(registerSchema))
  .use(errorHandler());