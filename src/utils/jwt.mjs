import jwt from "jsonwebtoken";

const getSecret = () => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is missing");
  }

  return secret;
};

export const generateToken = (username) => {
  return jwt.sign({ username }, getSecret(), {
    algorithm: "HS256",
    expiresIn: "1h",
  });
};

export const verifyToken = (token) => {
  return jwt.verify(token, getSecret(), {
    algorithms: ["HS256"],
  });
};
