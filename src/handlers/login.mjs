import middy from "@middy/core";
import httpJsonBodyParser from "@middy/http-json-body-parser";

import { sendResponse, sendError } from "../responses/index.mjs";
import { errorHandler } from "../middlewares/errorHandler.mjs";
import { validateBody } from "../middlewares/validateBody.mjs";
import { loginSchema } from "../schemas/authSchema.mjs";
import { getUserByUsername } from "../repositories/userRepository.mjs";
import { verifyPassword } from "../utils/password.mjs";
import { generateToken } from "../utils/jwt.mjs";

const loginHandler = async (event) => {
  const { username, password } = event.body;

  const user = await getUserByUsername(username);

  if (!user) {
    return sendError(401, "Invalid username or password");
  }

  const isValid = await verifyPassword(
    password,
    user.passwordHash
  );

  if (!isValid) {
    return sendError(401, "Invalid username or password");
  }

  const token = generateToken(user.username);

  return sendResponse(200, {
    message: "Login successful",
    token,
    username: user.username,
  });
};

export const handler = middy(loginHandler)
  .use(httpJsonBodyParser())
  .use(validateBody(loginSchema))
  .use(errorHandler());