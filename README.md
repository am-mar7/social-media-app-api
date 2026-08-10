# Social Media API 

This repository implements a backend API for a social-media style application built with NestJS and TypeORM. It provides user accounts, posts, comments, tags, uploads, and per-post metadata. The API is production-minded (authentication, token refresh, transactional updates, and DTO validation) while remaining easy to extend.

## Quick Links

- Source: src/ (controllers, modules, providers)
- Main entry: src/main.ts
- App module: src/app.module.ts
- Posts: src/posts
- Meta options: src/meta-options
- Auth: src/auth

## Tech stack

- Node.js + TypeScript
- NestJS framework
- TypeORM (Postgres-friendly) for ORM
- class-validator / class-transformer for DTO validation and serialization


## Project overview

This project implements a social media API that supports:

- Authentication: local email/password and Google OAuth, access + refresh JWT flows, refresh token rotation.
- Users & Profiles: user registration, profile serialization (passwords excluded from responses), and account-related endpoints.
- Posts: create, read, update, delete posts with pagination, tags, and per-post metadata.
- MetaOptions: per-post metadata modeled as multiple `MetaOption` rows so entries can be updated/created/deleted atomically.
- Comments: authenticated users can add comments to posts.
- Tags: lightweight tagging CRUD and assignment to posts.
- Uploads: file upload endpoints with an upload provider abstraction (e.g. ImageKit integration).

The codebase is organized into feature modules (auth, users, posts, comments, tags, uploads, meta-options) and uses DTOs + validation for request shapes.


## Important design decisions (current)

- `MetaOption` is modeled as `@ManyToOne` → `Post` and `Post.metaOptions` is `@OneToMany` to allow multiple metadata rows per post and transactional replace.
- Use transactional DB operations for replace/update of meta rows (`MetaOptionsService.replaceMetaOptionsForPost(post, incoming[])`).
- Sensitive logging removed: avoid `console.log` of tokens, requests, or uploaded file buffers; use `Logger.debug()` with non-sensitive context.
- Global `ClassSerializerInterceptor` is enabled so entities annotated with `@Exclude()` (e.g., `User.password`) are not sent in responses.

## Repository structure (high-level)

- src/
	- app.module.ts — application root module
	- main.ts — application bootstrap
	- auth/ — authentication controllers, providers, guards
	- posts/ — post entity, controller, DTOs, service
	- meta-options/ — meta-option entity and service (replace logic)
	- users/, comments/, tags/, uploads/ — related modules and providers
	- common/ — interceptors, pagination helpers

## Running the project (development)

1. Install dependencies

```bash
npm install
```

2. Environment variables

Create a `.env` (or provide env vars) with at least the DB and JWT config. Example keys expected:

- `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_USER`, `DATABASE_PASSWORD`, `DATABASE_NAME`
- `JWT_SECRET`, `JWT_EXPIRES_IN`, `JWT_REFRESH_TOKEN_SECRET`

3. Start the app

```bash
npm run start:dev
```

4. Open API (default) at `http://localhost:3000` (or configured port)


## Database and migrations

- The project uses TypeORM. In development `synchronize: true` may be convenient; for production generate controlled migrations and apply them via TypeORM CLI.

Migration guidance for `MetaOption` model change:

1. Create the `meta_option` table with a `postId` FK and a JSON column `metaValue` if it doesn't exist.
2. If you previously stored metadata as a single JSON blob per post, write a controlled migration script (Node/TypeORM script) to read the old JSON and insert one or more `meta_option` rows per post.
3. Validate migrated rows and add indexes if required.

Example outline (SQL):

```sql
ALTER TABLE meta_option ADD COLUMN postId integer;
ALTER TABLE meta_option ADD CONSTRAINT fk_meta_post FOREIGN KEY (postId) REFERENCES post(id) ON DELETE CASCADE;
```

Prefer to run migration scripts in a staging environment before production.


## Key endpoints (examples)

- `POST /auth/signin` — sign in with email/password
- `POST /auth/signup` — register a new user (passwords validated and hashed)
- `POST /auth/google` — Google OAuth endpoints
- `POST /auth/refresh` — exchange refresh token for an access token
- `POST /posts` — create post with optional `metaOptions` (auth required)
- `GET /posts` — list posts with pagination and filters
- `GET /posts/:id` — retrieve a single post (includes metaOptions and tags)
- `PATCH /posts/:id` — update post and perform transactional replace of `metaOptions`
- `POST /comments` — create comment (auth required)
- `POST /uploads` — upload file via configured provider

Create post example (JSON body):

```http
POST /posts
Authorization: Bearer <token>
Content-Type: application/json

{
	"title": "A post",
	"slug": "a-post",
	"postType": "other",
	"status": "published",
	"metaOptions": [
		{ "metaValue": { "key": "value1" } },
		{ "metaValue": { "key": "value2" } }
	]
}
```

Patch `metaOptions` example (transactional replace): provide `id` to update existing entries, omit to create new ones; rows missing from the incoming array will be deleted.

## DTOs and validation

- DTOs use `class-validator` and nested DTOs for arrays.
- `CreatePostDto` and `PatchPostDto` accept `metaOptions` as an array of `CreatePostMetaOptionsDto` (nested validation enabled).


## Security notes

- `User.password` is excluded from responses via `@Exclude()` and global `ClassSerializerInterceptor`.
- Refresh token handling should return `401 Unauthorized` for invalid/expired tokens; avoid `500` responses for auth errors.
- Avoid logging secrets or full request payloads. Use `Logger.debug()` with caution and redact sensitive fields.

## Tests

- E2E tests live in `test/` using Jest. Run them with:

```bash
npm run test:e2e
```


## Development tips and next tasks

- Add integration tests for `MetaOptionsService.replaceMetaOptionsForPost` to assert update/create/delete semantics within a transaction.
- Generate a TypeORM migration to implement the relation/schema change for `MetaOption` prior to production deployment.
- Add endpoint tests covering auth, token refresh, and role/permission boundaries if extended.

---

If you'd like, I can now:

- Generate a TypeORM migration script to convert existing meta JSON into `MetaOption` rows.
- Add automated integration tests for transactional meta replacement.
- Produce a compact API reference markdown for documentation or Postman collection.

Tell me which of these you'd like next.

## Contributing

Fork and send PRs; run linters and tests before submitting.

---

If you'd like, I can now:

- Generate a TypeORM migration SQL/script to migrate existing metadata to the new `MetaOption` rows.
- Add automated tests for the transactional meta replace.
- Produce a compact API reference markdown for docs.

Tell me which of these you'd like next.

