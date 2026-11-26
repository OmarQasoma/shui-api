import {
  createUser,
  getUserByUsername,
} from "../repositories/userRepository.mjs";

import { hashPassword, verifyPassword } from "../utils/password.mjs";

import { generateToken } from "../utils/jwt.mjs";

export const registerUser = async ({ username, password }) => {
  const passwordHash = await hashPassword(password);

  try {
    await createUser({
      username,
      passwordHash,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    if (error.name === "ConditionalCheckFailedException") {
      throw Object.assign(new Error("Username already registered"), {
        statusCode: 409,
      });
    }

    throw error;
  }

  return { username };
};

export const loginUser = async ({ username, password }) => {
  const user = await getUserByUsername(username);

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    throw Object.assign(new Error("Invalid username or password"), {
      statusCode: 401,
    });
  }

  const token = generateToken(user.username);

  return {
    token,
    username: user.username,
  };
};
