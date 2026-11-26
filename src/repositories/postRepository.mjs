import {
  GetCommand,
  PutCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

import { db } from "../services/db.mjs";

const TABLE_NAME = process.env.POSTS_TABLE;

export const createPost = async (post) => {
  await db.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: post,
      ConditionExpression: "attribute_not_exists(id)",
    }),
  );

  return post;
};

export const getPostById = async (id, { includePending = false } = {}) => {
  const result = await db.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { id },
      ConsistentRead: true,
    }),
  );

  const post = result.Item;

  if (!post) {
    return null;
  }

  if (post.deletionPending && !includePending) {
    return null;
  }

  return post;
};

export const getAllPosts = async (username) => {
  const posts = [];
  let lastKey;

  do {
    const result = await db.send(
      new ScanCommand({
        TableName: TABLE_NAME,
        ExclusiveStartKey: lastKey,
        ConsistentRead: true,
      }),
    );

    posts.push(...(result.Items ?? []));
    lastKey = result.LastEvaluatedKey;
  } while (lastKey);

  return posts
    .filter((post) => !post.deletionPending)
    .filter((post) => !username || post.username === username)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
};

export const updatePost = async (id, username, title, content) => {
  const result = await db.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression:
        "SET title = :title, content = :content, updatedAt = :updatedAt",
      ConditionExpression:
        "attribute_exists(id) AND username = :username AND isGuest = :isGuest AND attribute_not_exists(deletionPending)",
      ExpressionAttributeValues: {
        ":title": title,
        ":content": content,
        ":updatedAt": new Date().toISOString(),
        ":username": username,
        ":isGuest": false,
      },
      ReturnValues: "ALL_NEW",
    }),
  );

  return result.Attributes;
};

export const markPostForDeletion = async (id, username) => {
  await db.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression: "SET deletionPending = :pending",
      ConditionExpression:
        "attribute_exists(id) AND username = :username AND isGuest = :isGuest",
      ExpressionAttributeValues: {
        ":pending": true,
        ":username": username,
        ":isGuest": false,
      },
    }),
  );
};

export const deletePost = async (id, username) => {
  await db.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { id },
      ConditionExpression:
        "attribute_exists(id) AND username = :username AND isGuest = :isGuest AND deletionPending = :pending",
      ExpressionAttributeValues: {
        ":username": username,
        ":isGuest": false,
        ":pending": true,
      },
    }),
  );
};
