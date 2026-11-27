import { sendError } from "../responses/index.mjs";

export const errorHandler = () => ({
  onError: async (request) => {
    const statusCode = request.error?.statusCode;

    if (statusCode === 422 || statusCode === 415) {
      request.response = sendError(400, "Invalid or malformed JSON");
      return;
    }

    if (Number.isInteger(statusCode) && statusCode >= 400 && statusCode < 500) {
      request.response = sendError(statusCode, request.error.message);
    } else {
      request.response = sendError(500, "Internal Server Error");
    }
  },
});
