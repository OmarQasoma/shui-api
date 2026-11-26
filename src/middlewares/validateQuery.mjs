import { sendError } from "../responses/index.mjs";

export const validateQuery = (schema) => ({
  before: async (request) => {
    const result = schema.safeParse(request.event.queryStringParameters ?? {});

    if (!result.success) {
      return sendError(400, "Invalid query parameters");
    }

    request.event.queryStringParameters = result.data;
  },
});
