import { sendError } from "../responses/index.mjs";

export const validateBody = (schema) => ({
  before: async (request) => {
    const result = schema.safeParse(request.event.body);

    if (!result.success) {
      return sendError(
        400,
        result.error.issues[0].message
      );
    }

    request.event.body = result.data;
  },
});