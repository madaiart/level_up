# Nx NestJS API Template

<a alt="Nx logo" href="https://nx.dev" target="_blank" rel="noreferrer"><img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45"></a>

A production-ready NestJS REST API starter powered by Nx - built for teams who want a solid monorepo foundation with shared types, module boundaries, and Docker support from day one.

Tooling is [Vite+](https://viteplus.dev) (`vp`), orchestrated by Nx: `vp pack` (tsdown: rolldown + the oxc transformer) builds the API, `vp test` (Vitest 5) runs tests, `vp lint` (Oxlint, type-aware) lints and type-checks, `vp fmt` (Oxfmt) formats, and `vp staged` runs the pre-commit checks. All config lives in `vite.config.ts` files. tsdown reads `apps/api/tsconfig.app.json`, so `experimentalDecorators` and `emitDecoratorMetadata` are honored - NestJS dependency injection and route reflection keep working with `reflect-metadata`.

## Finish your Nx platform setup

🚀 [Finish setting up your workspace](https://cloud.nx.app/connect/8uMhkG9JJ2) to get faster builds with remote caching, distributed task execution, and self-healing CI. [Learn more about Nx Cloud](https://nx.dev/ci/intro/why-nx-cloud).

## Quick Start

Clone this template into a new workspace:

```sh
npx create-nx-workspace@latest my-workspace --template nrwl/nestjs-template
cd my-workspace
```

### Install dependencies

The workspace uses **pnpm** (version pinned in `package.json` → `"packageManager": "pnpm@12.9.1"`).

```sh
pnpm install   # day-to-day: installs and updates pnpm-lock.yaml if package.json changed
pnpm ci        # CI / clean install: deletes node_modules, installs exactly what pnpm-lock.yaml says, fails if it's out of date
```

`pnpm ci` is pnpm's equivalent of `npm ci`. Use it in CI and Docker, and locally when you want a guaranteed clean install. pnpm 12 refuses to run dependency build scripts that haven't been approved; the allow/deny list lives in `pnpm-workspace.yaml` (`allowBuilds`).

### Dev server (hot reload)

The API needs Postgres running and migrated first (see [Database](#database-postgresql--raw-sql)):

```sh
cp .env.example .env          # first time only
pnpm nx run api:db:up         # start Postgres in Docker
pnpm nx run api:db:migrate    # create/update tables
pnpm nx run api:serve
```

The API starts at `http://localhost:3000/api` and the interactive API reference at `http://localhost:3000/reference`.

Endpoints:

| Method   | Path             | Description                                                                      |
| -------- | ---------------- | -------------------------------------------------------------------------------- |
| `GET`    | `/api`           | Hello message                                                                    |
| `GET`    | `/api/health`    | Process health (uptime + timestamp)                                              |
| `GET`    | `/api/health/db` | Database health: `200` if Postgres answers `select 1`, `503` if not              |
| `GET`    | `/api/user`      | List users                                                                       |
| `PATCH`  | `/api/user`      | Add one user `{ name, email }` or an array of them. `409` on duplicate email     |
| `GET`    | `/api/todos`     | List todos. Optional filter: `?userId=1`                                         |
| `POST`   | `/api/todos`     | Create a todo `{ "title": "...", "userId": 1 }`. `404` if the user doesn't exist |
| `GET`    | `/api/todos/:id` | Get one todo                                                                     |
| `PATCH`  | `/api/todos/:id` | Update `{ title?, completed? }` (the owner can't be changed)                     |
| `DELETE` | `/api/todos/:id` | Delete a todo (`204`)                                                            |

### Build for production

```sh
pnpm nx run api:build
```

This runs `vp pack` (tsdown) via Nx and emits `dist/apps/api/main.mjs`. Run it directly with `node dist/apps/api/main.mjs`.

### Run all builds

```sh
pnpm nx run-many -t build
```

### Run tests

```sh
pnpm nx run-many -t test
```

### Lint, format, type-check

```sh
pnpm nx run-many -t lint   # vp lint per project (Oxlint + type check), cached by Nx
pnpm check                 # vp check: format check + lint + type check for the whole workspace
pnpm check:fix             # same, but formats and applies lint autofixes
pnpm format                # vp fmt (Oxfmt) only
```

The pre-commit hook (`.vite-hooks/pre-commit`) runs `vp staged`, which runs `vp check --fix` on staged files (the `staged` block in the root `vite.config.ts`). `pnpm install` installs the hook through the `prepare` script (`vp config`).

**VS Code:** install the recommended _Vite Plus Extension Pack_ (Oxc + Vitest). `.vscode/settings.json` makes Oxc the formatter and fixes on save.

### Visualize the project graph

```sh
pnpm nx graph
```

---

## What's Inside

```
my-workspace/
|- vite.config.ts              # Vite+ root config: lint (Oxlint), fmt (Oxfmt), staged (pre-commit)
|- .vite-hooks/pre-commit      # Runs `vp staged`
|- docker-compose.yml          # Local Postgres 18 (health-checked, data in a named volume)
|- .env.example                # Template for .env (copy it; .env is gitignored)
|- apps/
|  |- api/                     # NestJS application (vp pack build orchestrated by Nx)
|     |- vite.config.ts        # pack (build: decorators + metadata, bundles @nestjs-template/utils) + test config
|     |- db/
|     |  |- migrations/        # dbmate migrations: plain SQL with -- migrate:up / -- migrate:down (commit these)
|     |  |- schema.sql         # Full schema snapshot from `db:dump` (commit it; review it in diffs)
|     |- Dockerfile            # Multi-stage Docker build
|     |- src/
|        |- main.ts            # Bootstrap: /api prefix, Scalar reference, shutdown hooks
|        |- app.module.ts      # Root module: ConfigModule, DatabaseModule, feature modules
|        |- config/
|        |  |- env.validation.ts      # Zod schema for env vars; app refuses to start if invalid
|        |- database/
|        |  |- database.module.ts     # Global module: creates the postgres.js client, closes it on shutdown
|        |  |- database.constants.ts  # SQL injection token + `Database` type
|        |  |- pg-errors.ts           # Maps Postgres error codes (unique / FK violation)
|        |- health/            # GET /api/health, GET /api/health/db
|        |- user/              # /api/user - user.service.ts holds the SQL, user.row.ts the row type
|        |- todos/             # /api/todos - todos.service.ts holds the SQL, todo.row.ts the row type
|        |- common/pipes/      # StandardSchemaValidationPipe (validates with Zod schemas)
|- packages/
   |- utils/                   # @nestjs-template/utils - shared DTOs (Zod) + interfaces (scope:shared)
      |- src/<resource>/dto/         # Zod schemas + inferred types, e.g. createTodoSchema
      |- src/<resource>/interfaces/  # Response shapes, e.g. Todo, User, DbHealthResponse
```

### Module Boundary Tags

| Project | Tags                   | May depend on |
| ------- | ---------------------- | ------------- |
| api     | scope:api, type:app    | scope:shared  |
| utils   | scope:shared, type:lib | scope:shared  |

`@nx/enforce-module-boundaries` runs inside Oxlint as a JS plugin (`jsPlugins: ['@nx/eslint-plugin']` in the root `vite.config.ts`), so violations are caught at lint time, not at runtime.

---

## Featured Nx Capabilities

### Smart Computation Caching

Every build, test, and lint result is cached locally (and remotely via Nx Cloud). Re-running unchanged tasks is instant.

```sh
pnpm nx run api:build   # second run: < 100 ms from cache
```

### Affected Commands

Only run what actually changed since your last commit or PR base:

```sh
pnpm nx affected -t build,test,lint
```

### Code Generation

Scaffold new resources without boilerplate:

```sh
# New NestJS app
pnpm nx g @nx/nest:app my-service

# New shared library
pnpm nx g @nx/js:lib packages/my-lib --bundler=tsc

# NestJS resource (CRUD module, controller, service, DTOs)
pnpm nx g @nx/nest:resource --project=api --name=users
```

### Module Boundaries

Enforce architectural rules at lint time. A `scope:api` library can never accidentally import from another app - only from `scope:shared` libs. Configure the rules in the `lint` block of the root `vite.config.ts`.

### Database (PostgreSQL + raw SQL)

**Stack:** PostgreSQL 18 in Docker, [postgres.js](https://github.com/porsager/postgres) for queries, and [dbmate](https://github.com/amacneil/dbmate) for migrations. There is **no ORM or query builder**: you write real SQL, so every Postgres feature (CTEs, window functions, JSONB, arrays, `upsert`, triggers, `LISTEN/NOTIFY`, ...) is available as-is.

- **postgres.js** is a driver, not a wrapper. You write SQL in tagged template literals, and every `${value}` becomes a bound parameter (`$1`, `$2`, ...), so values can never be injected as SQL. It also handles pooling, transactions (`sql.begin`), and dynamic fragments.
- **dbmate** runs plain `.sql` migration files and records applied ones in the `schema_migrations` table. It's a single binary installed from npm (`dbmate` devDependency), with no config file.

#### Commands

| Command                                      | What it does                                                                               |
| -------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `pnpm nx run api:db:up`                      | Start Postgres (`docker compose up -d --wait`)                                             |
| `pnpm nx run api:db:down`                    | Stop Postgres. Data is kept in the `postgres-data` volume                                  |
| `pnpm nx run api:db:new --name=<snake_case>` | Create an empty migration `apps/api/db/migrations/<timestamp>_<name>.sql`                  |
| `pnpm nx run api:db:migrate`                 | Apply pending migrations (waits for the DB to be reachable)                                |
| `pnpm nx run api:db:rollback`                | Undo the most recent migration (runs its `migrate:down` section)                           |
| `pnpm nx run api:db:status`                  | List migrations and whether each one is applied                                            |
| `pnpm nx run api:db:dump`                    | Write the current schema to `apps/api/db/schema.sql` (runs `pg_dump` inside the container) |

To wipe the database completely: `docker compose down -v` (deletes the volume), then `db:up` + `db:migrate`.

#### Configuration

All settings come from environment variables. Nx automatically loads the workspace-root `.env` into every task (`serve`, `db:migrate`, ...), and Docker Compose reads the same file.

| Variable                                                             | Used by        | Default / example                                                                 |
| -------------------------------------------------------------------- | -------------- | --------------------------------------------------------------------------------- |
| `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `POSTGRES_PORT` | docker-compose | `postgres` / `postgres` / `level_up` / `5432`                                     |
| `DATABASE_URL`                                                       | API, dbmate    | `postgres://postgres:postgres@localhost:5432/level_up?sslmode=disable` (required) |
| `DATABASE_POOL_MAX`                                                  | API            | `10`                                                                              |
| `NODE_ENV`                                                           | API            | set by the Nx `serve` / `build` targets (required)                                |
| `PORT`                                                               | API            | `3000`                                                                            |

The API validates these with Zod on startup (`apps/api/src/config/env.validation.ts`) and exits with a readable error if any are missing or invalid.

`?sslmode=disable` is needed locally because the Docker Postgres has no TLS and dbmate's driver requires SSL by default. Drop it, or use `sslmode=require`, for a hosted database.

#### IDs: sequential GUIDs (UUIDv7)

**Every primary key and foreign key in the app is a UUIDv7**, e.g. `01a132df-fc1f-7b27-bd78-aa20d36641b0`.

- It's a standard 128-bit UUID, so IDs are globally unique, can't be guessed by counting, and can be generated anywhere.
- The first 48 bits are a millisecond timestamp, so IDs **sort by creation time**. New rows are appended to the end of the primary-key index instead of landing at random positions (the problem with random v4 UUIDs), so inserts stay as fast as with auto-increment integers. `ORDER BY id` returns rows in creation order.
- Postgres 18 generates them with its built-in `uuidv7()` function, so no app code or extension is needed.

How to apply it to new tables (in a migration):

```sql
create table projects (
  id         uuid primary key default uuidv7(),           -- every PK
  owner_id   uuid not null references users (id),          -- every FK is a plain uuid
  name       varchar(100) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index projects_owner_id_idx on projects (owner_id);  -- Postgres doesn't index FKs automatically

create trigger projects_set_updated_at
  before update on projects
  for each row execute function set_updated_at();          -- defined in the init migration
```

In the API layer:

- Interfaces in `@nestjs-template/utils` type IDs as `string`.
- DTO fields that reference another row use `z.uuid()`, e.g. `userId: z.uuid()`.
- Route params use `new ParseUUIDPipe({ version: '7' })`. A malformed ID returns `400` instead of reaching the database.

#### Schema

```
users                                   todos
-----------------------------           -----------------------------------------
id          uuid PK  default uuidv7()  1──N  id          uuid PK  default uuidv7()
name        varchar(100)  not null       title       varchar(200)  not null
email       varchar(320)  not null       completed   boolean       not null, default false
created_at  timestamptz   default now()  user_id     uuid          not null, FK -> users.id ON DELETE CASCADE
updated_at  timestamptz   default now()  created_at  timestamptz   default now()
                                         updated_at  timestamptz   default now()
unique index on lower(email)             index on user_id
```

Rules the schema enforces:

- **Emails are unique, case-insensitively**: `Ana@x.com` and `ana@x.com` are the same user. The API returns `409 Conflict`.
- **A todo belongs to exactly one user**: `user_id` is a required foreign key and there is no join table, so todos can't be shared. Creating a todo for a non-existent user returns `404`.
- **Deleting a user deletes their todos** (`ON DELETE CASCADE`).
- **`updated_at` is maintained by a database trigger** (`set_updated_at()`), so it's correct no matter who runs the `UPDATE`.

#### Migration workflow

1. `pnpm nx run api:db:new --name=add_due_date_to_todos` creates `apps/api/db/migrations/<timestamp>_add_due_date_to_todos.sql`.
2. Write the SQL in both sections:

   ```sql
   -- migrate:up
   alter table todos add column due_date date;

   -- migrate:down
   alter table todos drop column due_date;
   ```

3. `pnpm nx run api:db:migrate` applies it. Each migration runs in a transaction, so a failing migration leaves nothing half-applied.
4. Test the down section: `db:rollback`, then `db:migrate` again.
5. `pnpm nx run api:db:dump` refreshes `apps/api/db/schema.sql`. Commit the migration and `schema.sql` together; the `schema.sql` diff shows reviewers the resulting schema.

Don't edit a migration after it has been applied anywhere (shared DB, CI, prod). Create a new one instead.

#### Writing queries (postgres.js)

The client is injected with the `SQL` token. Results come back as arrays of rows, and columns are camelCased (`created_at` → `createdAt`) by `transform: postgres.camel`.

```ts
import { Inject, Injectable } from '@nestjs/common';
import { type Database, SQL } from '../database/database.constants';
import type { TodoRow } from './todo.row';

@Injectable()
export class ExampleService {
  constructor(@Inject(SQL) private readonly sql: Database) {}

  // ${userId} is sent as a bound parameter, never spliced into the SQL text
  findForUser(userId: string) {
    return this.sql<TodoRow[]>`
      select * from todos where user_id = ${userId} order by id
    `;
  }
}
```

Common patterns used in this codebase:

| Need                        | How                                                                                               | Example in         |
| --------------------------- | ------------------------------------------------------------------------------------------------- | ------------------ |
| Insert one or many objects  | ``sql`insert into users ${sql(rows, 'name', 'email')} returning *` ``                             | `user.service.ts`  |
| Update only the sent fields | ``sql`update todos set ${sql(dto, columns)} where id = ${id} returning *` ``                      | `todos.service.ts` |
| Optional `WHERE` clause     | ```sql`select * from todos ${userId ? sql`where user_id = ${userId}` : sql``}` ```                | `todos.service.ts` |
| Rows affected               | ``const result = await sql`delete ...`; result.count``                                            | `todos.service.ts` |
| Transaction                 | ``await sql.begin(async (tx) => { await tx`...`; await tx`...`; })``                              | -                  |
| Dynamic table/column name   | `sql('column_name')` (identifier, safely quoted). Never put identifiers in `${}` as plain strings | -                  |
| `IN` list                   | ``sql`select * from todos where id in ${sql(ids)}` ``                                             | -                  |

Rules:

- **Never build SQL with string concatenation** or `sql.unsafe()` with user input. Use `${}` for values and `sql('identifier')` for names.
- **Type each query** with a row interface (`sql<TodoRow[]>`). Row types live next to the service (`todo.row.ts`, `user.row.ts`) and match the table columns, camelCased. They're compile-time only, so keep them in sync with migrations.
- **Map rows to the shared API interfaces** in `@nestjs-template/utils` before returning them (see `toTodo` / `toUser`). DB rows don't leak straight into responses.
- **Let Postgres enforce rules** (unique, FK, check constraints), then translate errors with `getPgErrorCode()` from `database/pg-errors.ts` (e.g. `23505` → `409`, `23503` → `404`).
- `DatabaseModule` is global, so feature modules don't need to import it.

#### Health and resilience

- `GET /api/health/db` runs `select 1` with a 3-second timeout. It returns `503` with `{ status: "error", database: "down", error }` when Postgres is unreachable, so a load balancer or orchestrator can react.
- New connections time out after 5 seconds (`connect_timeout`) instead of hanging.
- If Postgres restarts, postgres.js reconnects on the next query; the API keeps running. Verified by stopping and restarting the container.
- On `SIGTERM`/`SIGINT`, connections are closed cleanly (`app.enableShutdownHooks()` + `sql.end()` in `DatabaseModule.onApplicationShutdown`).

### Docker

The `apps/api/Dockerfile` uses a multi-stage build:

1. **builder** - installs pnpm, runs `pnpm ci`, builds with `nx run api:prune` (the `vp pack` build plus a pruned `package.json` + `pnpm-lock.yaml`), then runs `pnpm ci --prod` on the pruned output in `/prod`
2. **runner** - Node 22 slim image with `main.mjs` and production `node_modules` only

Notes on why the Dockerfile looks the way it does:

- **Debian `slim`, not Alpine:** pnpm 12 is a native binary and crashes on Alpine (musl).
- **pnpm install is verified and retried:** the native binary is an optional npm dependency. If its download fails, npm skips it silently and leaves a `pnpm` that segfaults.
- **Production deps are installed in `/prod`, outside `/app`:** inside `/app`, pnpm would treat the whole workspace as the project.
- **`.dockerignore` excludes all of `.nx`:** copying `.nx/workspace-data` without `.nx/cache` made Nx report cache hits that restored nothing, leaving `dist/` empty.
- **`.env` is excluded too.** Pass config at runtime instead.
- **`NX_NO_CLOUD=true`:** image builds don't depend on Nx Cloud.
- **Migrations are not run by the image** (see Progress Log).

Run it against the local Postgres (`--network host` lets the container reach `localhost:5432`):

```sh
docker build -f apps/api/Dockerfile -t level-up-api .
docker run --rm --network host -e DATABASE_URL=postgres://postgres:postgres@localhost:5432/level_up level-up-api
```

---

## Nx Cloud

[Nx Cloud](https://nx.dev/nx-cloud) makes distributed CI simple:

- **Remote cache** - Shares the computation cache across all machines - one build warms the cache for everyone else.
- **Distributed task execution (DTE)** - Splits tasks across N CI agents automatically - no manual job matrix required.
- **Flaky task detection** - Tracks pass/fail history per task, reruns flaky tasks so one bad agent doesn't fail the PR.
- **PR insights** - Shows exactly which tasks ran, which were cache hits, and what slowed down your pipeline.

Docs -> https://nx.dev/nx-cloud

---

## Progress Log

What has been built so far, and what's still open. Update this section as work lands.

### Done

- **Workspace setup:** Nx monorepo, NestJS API built with tsdown/oxc, lint + format pre-commit hook (husky + lint-staged).
- **API restructure:** per-resource folders (`health/`, `user/`, `todos/`) with `app.module.ts` / `main.ts` at the `src/` root.
- **Shared utils lib:** `packages/utils` (`@nestjs-template/utils`) holds the Zod DTOs and response interfaces so a frontend can reuse them. Controllers validate with `StandardSchemaValidationPipe(schema)`.
- **Env config:** `@nestjs/config` with Zod validation (`config/env.validation.ts`).
- **PostgreSQL:**
  - Postgres 18 in Docker (`docker-compose.yml`), `.env.example`, and Nx targets `db:up` / `db:down`.
  - First migration `0000_init_users_todos`: `users` and `todos` tables (one user -> many todos, todos not shareable).
  - `UserService` and `TodosService` moved from in-memory arrays to Postgres.
  - `POST /api/todos` now requires `userId`. `GET /api/todos` accepts `?userId=`. `Todo` includes `userId`.
  - New `GET /api/health/db` endpoint.
- **Sequential GUID IDs:** all primary and foreign keys are UUIDv7, generated by Postgres `uuidv7()` (`default uuidv7()` on every PK). API IDs are strings, validated with `z.uuid()` / `ParseUUIDPipe({ version: '7' })`. The initial migration was regenerated with UUID columns; it had never been committed or shared.
- **Drizzle replaced with raw SQL** (2026-10-12):
  - Queries use postgres.js tagged templates (`user.service.ts`, `todos.service.ts`, `health.service.ts`).
  - Migrations use dbmate: plain SQL files in `apps/api/db/migrations`, with Nx targets `db:new` / `db:migrate` / `db:rollback` / `db:status` / `db:dump`.
  - The init migration was rewritten by hand in SQL and adds a `set_updated_at()` trigger.
  - Removed `drizzle-orm`, `drizzle-kit`, `pg` and `@types/pg`, plus the `src/database/schema/` folder and `drizzle.config.ts`.
- **Row types derived from shared interfaces** (2026-10-18): removed `user.row.ts` / `todo.row.ts`. The services now derive `UserRow` / `TodoRow` from `User` / `Todo` in `@nestjs-template/utils` (`Omit<User, 'createdAt'> & { createdAt: Date }`), so the fields are declared in one place.
- **Transactions via `QueryRunner`** (2026-10-18): `database/query-runner.ts`, provided globally by `DatabaseModule`.
  - `queryRunner.transaction(async () => { ... }, 'isolation level serializable'?)` wraps postgres.js `sql.begin()`: it commits if the callback resolves and rolls back if it throws.
  - The active transaction is tracked with `AsyncLocalStorage`, so `queryRunner.sql` returns the transaction inside `transaction()` and the pool everywhere else. `UserService` and `TodosService` query through it, so their methods join a caller's transaction without passing `tx` around. Nested `transaction()` calls join the outer one.
  - `HealthService` still uses the raw pool on purpose: the DB health probe should never run inside a transaction.
- **Zod row schemas replace hand-written mappers** (2026-10-19): `toUser` / `toTodo` are gone. `user/user.row.ts` and `todos/todo.row.ts` define `userRowSchema` / `todoRowSchema` (with `UserRow` / `TodoRow` = `z.input<...>`), plus `userRowsSchema` / `todoRowsSchema` (with `UserRows` / `TodoRows`) for lists. The services type queries as `sql<UserRows>` and call `userRowSchema.parse(row)` / `userRowsSchema.parse(rows)`. Parsing turns `timestamptz` Dates into ISO strings (the `timestamptz` codec in `database/columns.ts`) and drops columns not listed, such as `updatedAt`. Each schema is checked with `satisfies z.ZodType<User | Todo>`, so it can't drift from the shared interfaces. This supersedes the 2026-10-18 `Omit<...>` row types.
- **Removed a stray standalone install in `apps/api`** (2026-10-19): deleted `apps/api/pnpm-lock.yaml` and `apps/api/node_modules`, left over from a `pnpm install` run inside `apps/api`. The lockfile made the editor's TypeScript language server (vtsls) treat `apps/api` as the project root, so it couldn't find the workspace TypeScript 6 and fell back to its bundled 5.9, which caused false TS1320/TS2345 errors in `user.service.ts`. Always run `pnpm install` from the repo root.
- **pnpm everywhere:**
  - `packageManager` is pinned to `pnpm@12.9.1`.
  - Build-script approvals are filled in `pnpm-workspace.yaml`.
  - CI (`.github/workflows/ci.yml`) uses `pnpm/action-setup` + `pnpm ci` + `pnpm nx`.
  - The Dockerfile uses `pnpm ci` and was fixed so it actually builds and runs. It previously referenced a non-existent `package-lock.json`.
- **Fixes:**
  - `@nestjs/config` was imported but not installed, and was given a Zod schema as a Joi `validationSchema`.
  - The built `main.mjs` couldn't start because tsdown left `@nestjs-template/utils` external. It's now bundled: it was removed from `apps/api/package.json` dependencies, so tsdown inlines it through the alias. Nx still sees the dependency through imports.
  - The API crashed when Postgres restarted (unhandled `pg` pool `error` event). This went away with the switch to postgres.js, which reconnects on its own.
- **Moved to Vite+ 1.3.0** (2026-10-21), keeping Nx as the task orchestrator:
  - Ran `vp migrate`, then finished the parts it skips. `vite-plus` is pinned through the pnpm catalog in `pnpm-workspace.yaml` (Vite → `@voidzero-dev/vite-plus-core`, Vitest 5.0.5).
  - **Lint:** ESLint → Oxlint (`vp lint`). The ESLint rules were converted into the root `vite.config.ts`, with type-aware linting and type checking on. `@nx/enforce-module-boundaries` still runs, loaded as an Oxlint JS plugin (verified: a `utils` → `api` import fails lint). Removed `eslint`, `typescript-eslint`, `@eslint/js`, `eslint-config-prettier`, `@nx/eslint`, `jsonc-eslint-parser` and every `eslint.config.mjs`. Lost: `@nx/dependency-checks` on `packages/utils/package.json` (Oxlint doesn't lint JSON).
  - **Format:** Prettier → Oxfmt (`vp fmt`). `.prettierrc` / `.prettierignore` moved into the `fmt` block. The Nx-generated agent folders (`.agents`, `.claude`, `.github/skills`, ...) are ignored.
  - **Build:** `apps/api/tsdown.config.mts` → `pack` block in `apps/api/vite.config.ts`; `api:build` / `api:serve` run `vp pack`. Kept `deps.resolveDepSubpath: true` (tsdown <0.23 behavior) for now.
  - **Tests:** `vitest.config.mts` → `test` block in each app's `vite.config.ts`; tests import from `vite-plus/test`. Removed the `@nx/vitest` plugin; `api:test` and `api-e2e:e2e` are explicit `vp test` targets. Dropped the Vitest v4 `clearMocks: false` shim (no tests use mocks).
  - **Pre-commit:** husky + lint-staged → `vp staged` with the hook in `.vite-hooks/pre-commit` (`prepare` runs `vp config`). CI's format check is now `vp fmt --check`.
  - `vp migrate` removed `esModuleInterop: false` from `tsconfig.base.json` (deprecated in TS 6). `main.ts` now calls `void bootstrap()` (new `no-floating-promises` warning).
  - Verified: `nx run-many -t lint test build`, `vp check`, `nx run api:prune`, and the built `main.mjs` boots. The Docker image build was not re-run.

### Open / next steps

- [ ] **Authentication:** there's no auth yet, so any caller can read or edit any todo. Once auth exists, take `userId` from the logged-in user instead of the request body, and scope every todo query to that user.
- [ ] **Run migrations on deploy:** the API image doesn't contain the migrations or dbmate. Add a deploy step (or init container) that runs dbmate against the production DB before the new API version starts, e.g. the official image: `docker run --rm -v ./apps/api/db:/db -e DATABASE_URL=... ghcr.io/amacneil/dbmate:2.36 --no-dump-schema migrate`.
- [ ] **CI never runs:** the git repository root is `level_up/`, but the workflow is at `my-workspace/.github/workflows/ci.yml`. GitHub only reads `<repo root>/.github/workflows`. Move it there and set `defaults.run.working-directory: my-workspace`, plus `package_json_file` / `cache-dependency-path` for the pnpm and Node setup steps.
- [ ] **CI e2e:** needs a Postgres service and `DATABASE_URL`, plus a `db:migrate` step. The Nx Cloud workspace also isn't connected (`401`), so `nx start-ci-run` / distribution won't work until it's claimed or removed.
- [ ] **Tests:** add unit tests for `UserService` / `TodosService` and e2e tests against a real database.
- [ ] **User endpoints:** get, update and delete a single user. `PATCH /api/user` is used to _add_ users, where `POST` would be the usual choice.

---

## Install Nx Console

Nx Console is an editor extension that enriches your developer experience. It lets you run tasks, generate code, and improves code autocompletion in your IDE. It is available for VSCode and IntelliJ.

[Install Nx Console &raquo;](https://nx.dev/docs/getting-started/editor-setup?utm_source=nx_project&utm_medium=readme&utm_campaign=nx_projects)

## 🔗 Learn More

- [Nx Documentation](https://nx.dev/docs)
- [Crafting Your Workspace Tutorial](https://nx.dev/docs/getting-started/tutorials/crafting-your-workspace)
- [Module Boundaries](https://nx.dev/docs/features/enforce-module-boundaries)
- [NestJS Documentation](https://docs.nestjs.com)
- [Docker Integration](https://nx.dev/docs/guides/nx-release/release-docker-images)
- [Nx Cloud](https://nx.dev/nx-cloud)

## 💬 Community

Join the Nx community:

- [Discord](https://go.nx.dev/community)
- [X (Twitter)](https://twitter.com/nxdevtools)
- [LinkedIn](https://www.linkedin.com/company/nrwl)
- [YouTube](https://www.youtube.com/@nxdevtools)
- [Blog](https://nx.dev/blog)
