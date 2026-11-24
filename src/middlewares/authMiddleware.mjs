import { verifyToken } from "../utils/jwt.mjs";
import { sendError } from "../responses/index.mjs";

export const authMiddleware = ({ required = true } = {}) => ({
  before: async (request) => {
    const headers = request.event.headers ?? {};

    const authorization =
      headers.authorization ?? headers.Authorization;

    request.event.user = null;

    if (authorization === undefined) {
      if (required) {
        return sendError(401, "Authentication required");
      }

      return;
    }

    const match = /^Bearer\s+(\S+)$/i.exec(authorization);

    if (!match) {
      return sendError(401, "Invalid authorization format");
    }

    try {
      const decoded = verifyToken(match[1]);

      if (
        typeof decoded.username !== "string" ||
        !decoded.username ||
        typeof decoded.exp !== "number"
      ) {
        return sendError(401, "Invalid token");
      }

      request.event.user = {
        username: decoded.username,
      };
    } catch (error) {
      if (
        ["JsonWebTokenError", "TokenExpiredError", "NotBeforeError"]
          .includes(error.name)
      ) {
        return sendError(401, "Invalid or expired token");
      }

      throw error;
    }
  },
});