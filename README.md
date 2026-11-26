# Shui API

A serverless REST API for a digital bulletin board, built with Node.js, AWS Lambda, API Gateway and DynamoDB.

The project was developed as an individual examination for the **Apputveckling mot molnet** course in the Mobile Application Developer programme at Folkuniversitetet.

The implementation covers both the G (Godkänt) and VG (Väl godkänt) functional and architectural requirements.

## Live API

**Base URL:** https://n3v6ls5xzh.execute-api.eu-north-1.amazonaws.com

**Health endpoint:** https://n3v6ls5xzh.execute-api.eu-north-1.amazonaws.com/health

| Environment | Configuration |
|---|---|
| Cloud provider | Amazon Web Services |
| Region | eu-north-1 (Stockholm) |
| Stage | dev |
| Runtime | Node.js 24 |
| Infrastructure | Serverless Framework v4 |
| Lambda functions | 10 |
| DynamoDB tables | 3 |

## Features

### G — Core functionality

- User registration with unique usernames.
- Secure password hashing using bcrypt.
- User authentication using signed JWT tokens.
- Create, retrieve, update and delete posts.
- Public retrieval of posts.
- Filter posts by username.
- Restrict updates and deletions to post owners.
- Request validation using Zod.
- Consistent JSON responses and HTTP status codes.
- Persistent storage in DynamoDB.
- Deployment to AWS.

### VG — Extended functionality

- Guest publishing without authentication.
- Automatically generated guest usernames.
- Explicit distinction between registered and guest posts using `isGuest`.
- Protection against modification or deletion of guest posts.
- Protection against guest username collisions affecting ownership.
- Authenticated comment creation.
- Public retrieval of comments.
- Comments on registered and guest posts.
- Automatic deletion of associated comments when a post is deleted.
- Reusable authentication, authorization and validation middleware.
- Separation of HTTP handlers, business logic and database operations.

## Technology Stack

| Technology | Purpose |
|---|---|
| JavaScript (ES Modules) | Application development |
| Node.js 24 | Runtime environment |
| AWS Lambda | Serverless execution |
| Amazon API Gateway | HTTP API |
| Amazon DynamoDB | NoSQL database |
| AWS SDK v3 | Database integration |
| Serverless Framework v4 | Infrastructure and deployment |
| Middy | Middleware architecture |
| Zod | Request validation |
| bcryptjs | Password hashing |
| jsonwebtoken | JWT authentication |
| Insomnia | Manual API testing |
| Git and GitHub | Version control |

## Architecture

The application follows a layered architecture that separates HTTP handling, business logic and persistence.

```text
Client / Insomnia
        |
        v
AWS API Gateway
        |
        v
AWS Lambda + Middy
        |
        v
Middleware
        |
        v
HTTP Handlers
        |
        v
Business Logic / Services
        |
        v
Repositories
        |
        v
Amazon DynamoDB
```

### Architectural responsibilities

**Middleware**

Handles authentication, authorization, request validation, JSON parsing and centralized error handling.

**Handlers**

Receive HTTP requests, call the appropriate service and return standardized HTTP responses.

**Services**

Contain application-specific business logic, including registration, authentication, post management, comment management and cascade deletion.

**Repositories**

Encapsulate DynamoDB operations and database-level conditions.

**Schemas**

Define validation rules for incoming request data.

**Utilities**

Provide reusable password hashing and JWT operations.

This separation reduces duplication and keeps HTTP handlers focused on their primary responsibilities.

## Project Structure

```text
shui-api/
├── src/
│   ├── handlers/
│   │   ├── createComment.mjs
│   │   ├── createPost.mjs
│   │   ├── deletePost.mjs
│   │   ├── getComments.mjs
│   │   ├── getPost.mjs
│   │   ├── getPosts.mjs
│   │   ├── health.mjs
│   │   ├── login.mjs
│   │   ├── register.mjs
│   │   └── updatePost.mjs
│   ├── middlewares/
│   │   ├── authMiddleware.mjs
│   │   ├── authorizePostOwner.mjs
│   │   ├── errorHandler.mjs
│   │   ├── validateBody.mjs
│   │   └── validateQuery.mjs
│   ├── repositories/
│   │   ├── commentRepository.mjs
│   │   ├── postRepository.mjs
│   │   └── userRepository.mjs
│   ├── responses/
│   │   └── index.mjs
│   ├── schemas/
│   │   ├── authSchema.mjs
│   │   ├── commentSchema.mjs
│   │   └── postSchema.mjs
│   ├── services/
│   │   ├── authService.mjs
│   │   ├── commentService.mjs
│   │   ├── db.mjs
│   │   └── postService.mjs
│   └── utils/
│       ├── jwt.mjs
│       └── password.mjs
├── .gitignore
├── local.example.yml
├── package.json
├── package-lock.json
├── serverless.yml
└── README.md
```

## API Endpoints

### System

| Method | Endpoint | Access |
|---|---|---|
| GET | `/health` | Public |

### Authentication

| Method | Endpoint | Access |
|---|---|---|
| POST | `/auth/register` | Public |
| POST | `/auth/login` | Public |

### Posts

| Method | Endpoint | Access |
|---|---|---|
| GET | `/posts` | Public |
| GET | `/posts/{postId}` | Public |
| POST | `/posts` | Authenticated or guest |
| PUT | `/posts/{postId}` | Authenticated owner |
| DELETE | `/posts/{postId}` | Authenticated owner |

### Comments — VG

| Method | Endpoint | Access |
|---|---|---|
| GET | `/posts/{postId}/comments` | Public |
| POST | `/posts/{postId}/comments` | Authenticated |

The API implements all nine examination endpoints, with an additional health endpoint for deployment verification.

## API Usage

All request bodies containing data must use JSON.

### Register a user

`POST /auth/register`

```json
{
  "username": "exampleuser",
  "password": "ExamplePassword123!"
}
```

Expected response: `201 Created`

```json
{
  "message": "User registered successfully",
  "username": "exampleuser"
}
```

The example credentials are illustrative only.

### Log in

`POST /auth/login`

```json
{
  "username": "exampleuser",
  "password": "ExamplePassword123!"
}
```

Expected response: `200 OK`

```json
{
  "message": "Login successful",
  "token": "<JWT_TOKEN>",
  "username": "exampleuser"
}
```

Use the returned token when accessing protected endpoints.

```http
Authorization: Bearer <JWT_TOKEN>
```

### Create a post

`POST /posts`

```json
{
  "title": "Welcome to Shui",
  "content": "This is my first post."
}
```

Expected response: `201 Created`

When a valid JWT is provided, the post belongs to the authenticated user and has `isGuest: false`.

When no JWT is provided, a guest post is created with an automatically generated username and `isGuest: true`.

If an invalid JWT is provided, the request returns `401 Unauthorized` rather than creating a guest post.

### Retrieve posts

`GET /posts`

Returns all available posts, ordered from newest to oldest.

To filter by username:

```http
GET /posts?username=exampleuser
```

Filtering also supports automatically generated guest usernames.

An empty result is returned as:

```json
[]
```

### Retrieve a single post

`GET /posts/{postId}`

Returns the requested post or `404 Not Found` if it does not exist.

### Update a post

`PUT /posts/{postId}`

Requires authentication and ownership of the post.

```json
{
  "title": "Updated title",
  "content": "Updated content."
}
```

The post ID, username and creation date remain unchanged. The `updatedAt` timestamp is updated automatically.

Guest posts cannot be modified, even if a registered username matches the guest username.

### Delete a post

`DELETE /posts/{postId}`

Requires authentication and ownership.

A successful deletion returns `204 No Content`.

Associated comments are also deleted. Guest posts cannot be deleted through this endpoint.

### Create a comment

`POST /posts/{postId}/comments`

Requires a valid JWT.

```json
{
  "content": "This is a great post!"
}
```

Expected response: `201 Created`.

Registered users can comment on both registered and guest posts.

### Retrieve comments

`GET /posts/{postId}/comments`

Returns comments ordered from oldest to newest.

This endpoint is public. An existing post without comments returns an empty array, while a nonexistent post returns `404 Not Found`.

## Database Design

The application uses three DynamoDB tables with on-demand billing.

| Table | Partition key | Sort key |
|---|---|---|
| shui-api-dev-users | username | — |
| shui-api-dev-posts | id | — |
| shui-api-dev-comments | postId | id |

### Users

Stores unique usernames and password hashes. Plaintext passwords are never stored or returned by the API.

### Posts

Each post contains:

- `id`
- `username`
- `isGuest`
- `title`
- `content`
- `createdAt`
- `updatedAt`

### Comments

Each comment contains:

- `id`
- `postId`
- `username`
- `content`
- `createdAt`

Post and comment IDs are generated by the server using UUIDs. Timestamps use ISO 8601 format.

Conditional database operations enforce username uniqueness and post ownership. Transactional conditions protect comment creation against concurrent post deletion.

## Authentication and Security

### Password security

New passwords are hashed using bcrypt with a cost factor of 12.

Password hashes are never included in API responses. Registration validation also accounts for bcrypt's 72-byte password limit.

A compatibility mechanism supports verification of legacy scrypt hashes created during development.

### JWT authentication

The application uses signed JWT tokens with the HS256 algorithm and a one-hour expiration period.

The authenticated username is obtained from the verified token rather than from client-provided request data.

### Authorization

Ownership is verified using reusable middleware and database-level conditions.

For post updates and deletions, the following conditions must be satisfied:

- The request contains a valid JWT.
- The post exists.
- The authenticated username matches the post owner.
- The post is not a guest post.

### Input validation

Zod schemas validate authentication data, post content, comment content and supported query parameters.

| Field | Validation |
|---|---|
| Registration username | 3–50 characters |
| Registration password | Minimum 8 characters, subject to bcrypt's byte limit |
| Post title | 1–100 characters |
| Post content | 1–5,000 characters |
| Comment content | 1–1,000 characters |

### Secret management

Private deployment configuration is stored in a gitignored `local.yml` file.

Sensitive configuration includes the JWT signing secret and environment-specific deployment settings.

The repository contains only `local.example.yml` with placeholder values.

AWS credentials, private configuration, generated Serverless artifacts and installed dependencies must not be committed.

### IAM permissions

Deployment permissions and Lambda execution permissions are separated.

The application execution role grants the DynamoDB operations required by the application against its designated tables.

## HTTP Status Codes

| Status | Meaning |
|---|---|
| 200 | OK |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 500 | Internal Server Error |

Errors use a consistent JSON structure:

```json
{
  "error": "Post not found"
}
```

Internal server errors are handled centrally without exposing internal implementation details to clients.

## Installation and Deployment

### Prerequisites

- Node.js 24 and npm.
- Git.
- An AWS account with appropriate deployment permissions.
- AWS CLI configured with an authorized profile.
- An existing deployment bucket and CloudFormation deployment role.
- Serverless Framework v4 authentication.

### 1. Clone the repository

```bash
git clone https://github.com/OmarQasoma/shui-api.git
cd shui-api
```

### 2. Install dependencies

```bash
npm ci
```

### 3. Create local configuration

```bash
cp local.example.yml local.yml
```

Configure the file using environment-specific values.

```yaml
deploymentBucket: YOUR_DEPLOYMENT_BUCKET
deploymentRole: YOUR_DEPLOYMENT_ROLE_ARN
jwtSecret: YOUR_JWT_SECRET
```

The bucket and deployment role must exist and be accessible to the authorized deployment identity.

Generate a strong random JWT secret locally.

```bash
openssl rand -hex 32
```

Store the generated value privately in `local.yml`.

Never commit or share the actual configuration file.

### 4. Package the application

```bash
npx serverless package
```

### 5. Deploy to AWS

```bash
npx serverless deploy --aws-profile YOUR_AWS_PROFILE
```

The Serverless configuration specifies the AWS region and deployment stage.

Deployment creates or updates the configured Lambda functions, HTTP API and DynamoDB resources.

### 6. Verify deployment

```bash
curl -i https://n3v6ls5xzh.execute-api.eu-north-1.amazonaws.com/health
```

Expected response:

```json
{
  "message": "Shui API is running"
}
```

Verify public post retrieval:

```bash
curl -i https://n3v6ls5xzh.execute-api.eu-north-1.amazonaws.com/posts
```

When deploying to a separate AWS environment, use the API URL returned by Serverless Framework.

## Testing

The application was tested against the deployed AWS environment using Insomnia, curl and the DynamoDB console.

### Testing summary

| Verification | Result |
|---|---|
| Manual regression plan | 32 scenarios completed |
| Local password and validation checks | 13 checks passed |
| Lambda handler import checks | 10 handlers passed |
| npm dependency audit | No known vulnerabilities reported at the time of testing |
| AWS deployment | Successful |
| Cascade deletion | Verified directly in DynamoDB |
| Old JWT rejection | Verified |
| Registration and login after secret rotation | Verified |
| New JWT acceptance | Verified |

The regression plan covered:

- Registration and login.
- Duplicate usernames and invalid credentials.
- bcrypt password storage.
- Registered and guest publishing.
- Public retrieval and username filtering.
- Owner-only updates and deletions.
- Protection of guest posts.
- Guest username collision scenarios.
- Comment creation and retrieval.
- Comment ordering.
- Missing authentication.
- Invalid input.
- Cascade deletion.
- Preservation of unrelated database records.

The testing process combined HTTP response verification with direct database inspection.

These are manual regression results and targeted local checks, not a fully automated test suite. Some results were confirmed manually during the development process. The default `npm test` script remains a placeholder.

## Design Decisions and Limitations

The application was designed to satisfy the examination requirements while maintaining a clear separation of responsibilities.

- Post retrieval currently uses DynamoDB scans. Secondary indexes and pagination would improve scalability for larger datasets.
- Cascade deletion uses a deletion-pending state and conditional operations. The entire cascade is not a single atomic transaction, and an interrupted deletion may require an owner retry.
- JWT tokens expire after one hour. Individual token revocation and refresh-token functionality are not implemented.
- The application uses a shared Lambda execution role scoped to the required database operations.
- Production-level monitoring, rate limiting, managed secret storage and automated integration tests are potential future improvements.
- Full concurrency, load and fault-injection testing are outside the current testing scope.

## Development Workflow

The project uses Git and GitHub for version control, with feature branches and a development integration branch.

Development was organized around infrastructure setup, project foundation, core functionality, extended VG functionality, architectural improvements, security verification and documentation.

## Author

**Omar Qasoma**

Mobile Application Developer

Folkuniversitetet — Apputveckling mot molnet

Individual Examination — Autumn 2026

**GitHub:** https://github.com/OmarQasoma/shui-api