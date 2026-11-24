import {
  randomBytes,
  scrypt,
  timingSafeEqual,
} from "node:crypto";

import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

const options = {
  N: 131072,
  r: 8,
  p: 1,
  maxmem: 256 * 1024 * 1024,
};

export const hashPassword = async (password) => {
  const salt = randomBytes(16).toString("hex");
  const hash = await scryptAsync(password, salt, 64, options);

  return `${salt}:${hash.toString("hex")}`;
};

export const verifyPassword = async (password, storedHash) => {
  const [salt, hash] = storedHash.split(":");

  const originalHash = Buffer.from(hash, "hex");
  const suppliedHash = await scryptAsync(password, salt, 64, options);

  return (
    originalHash.length === suppliedHash.length &&
    timingSafeEqual(originalHash, suppliedHash)
  );
};