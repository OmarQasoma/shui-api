import {
  GetCommand,
  PutCommand,
} from "@aws-sdk/lib-dynamodb";

import { db } from "../services/db.mjs";

const TABLE_NAME = process.env.USERS_TABLE;

export const getUserByUsername = async (username) => {
  const result = await db.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { username },
      ConsistentRead: true,
    })
  );

  return result.Item ?? null;
};

export const createUser = async (user) => {
  await db.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: user,
      ConditionExpression: "attribute_not_exists(username)",
    })
  );

  return user;
};