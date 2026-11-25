import {
  PutCommand,
  QueryCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

import { db } from "../services/db.mjs";

const TABLE_NAME = process.env.COMMENTS_TABLE;

export const createComment = async (comment) => {
  await db.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: comment,
      ConditionExpression:
        "attribute_not_exists(postId) AND attribute_not_exists(id)",
    })
  );

  return comment;
};

export const getCommentsByPostId = async (postId) => {
  const comments = [];
  let lastKey;

  do {
    const result = await db.send(
      new QueryCommand({
        TableName: TABLE_NAME,
        KeyConditionExpression: "postId = :postId",
        ExpressionAttributeValues: {
          ":postId": postId,
        },
        ExclusiveStartKey: lastKey,
        ConsistentRead: true,
      })
    );

    comments.push(...(result.Items ?? []));
    lastKey = result.LastEvaluatedKey;
  } while (lastKey);

  return comments.sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt)
  );
};

export const deleteCommentsByPostId = async (postId) => {
  const comments = await getCommentsByPostId(postId);

  for (const comment of comments) {
    await db.send(
      new DeleteCommand({
        TableName: TABLE_NAME,
        Key: {
          postId,
          id: comment.id,
        },
      })
    );
  }
};