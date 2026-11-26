import bcrypt from "bcryptjs";

import {
  scrypt,
  timingSafeEqual,
} from "node:crypto";

import { promisify } from "node:util";

const SALT_ROUNDS = 12;

const scryptAsync = promisify(scrypt);

const legacyOptions = {
  N: 131072,
  r: 8,
  p: 1,
  maxmem: 256 * 1024 * 1024,
};

export const hashPassword = async (password) => {
  if (Buffer.byteLength(password, "utf8") > 72) {
    throw new Error("Password exceeds bcrypt limit");
  }

  return bcrypt.hash(password, SALT_ROUNDS);
};

export const verifyPassword = async (
  password,
  storedHash
) => {
  if (typeof storedHash !== "string") {
    return false;
  }

  if (/^\$2[aby]\$/.test(storedHash)) {
    if (Buffer.byteLength(password, "utf8") > 72) {
      return false;
    }

    return bcrypt.compare(password, storedHash);
  }

  // Temporary support for existing scrypt passwords.
  if (!/^[a-f0-9]{32}:[a-f0-9]{128}$/i.test(storedHash)) {
    return false;
  }

  const [salt, hash] = storedHash.split(":");

  const originalHash = Buffer.from(hash, "hex");

  const suppliedHash = await scryptAsync(
    password,
    salt,
    64,
    legacyOptions
  );

  return (
    originalHash.length === suppliedHash.length &&
    timingSafeEqual(originalHash, suppliedHash)
  );
};