export const sendResponse = (statusCode, data) => {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };
};

export const sendError = (statusCode, message) => {
  return sendResponse(statusCode, {
    error: message,
  });
};
