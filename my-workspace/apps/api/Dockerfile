# ---- Build Stage ----
# pnpm 12 crashes on Alpine (musl), so use the Debian-based slim image.
FROM node:22-slim AS builder

# Must match "packageManager" in package.json.
# pnpm 12 is a native binary shipped as an optional dependency. npm silently
# skips it if the download fails, leaving a pnpm that segfaults, so verify it
# runs and retry.
RUN for attempt in 1 2 3; do \
      npm install -g pnpm@12.9.1 && pnpm --version && exit 0; \
      echo "pnpm install attempt $attempt failed, retrying..."; \
      npm uninstall -g pnpm; sleep 3; \
    done; exit 1

WORKDIR /app

# Image builds must not depend on (or be slowed by) Nx Cloud
ENV NX_NO_CLOUD=true

# Copy lockfile and manifests first for layer caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# --ignore-scripts skips the husky "prepare" hook (no .git in the image)
RUN pnpm ci --ignore-scripts

# Copy source
COPY . .

# Build the api app with the oxc toolchain (tsdown) and prune the lockfile.
# The prune target depends on build, so this produces main.mjs plus a pruned
# package.json + pnpm-lock.yaml + workspace_modules in the output directory.
RUN pnpm nx run api:prune --configuration=production

# Install production-only packages against the pruned lockfile. Do it outside
# /app: inside it pnpm would treat /app as the workspace root and install (and
# clean) the wrong project.
RUN cp -r /app/dist/apps/api /prod
WORKDIR /prod
RUN pnpm ci --prod --ignore-scripts

# ---- Runtime Stage ----
FROM node:22-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy built output + production node_modules
COPY --from=builder /prod ./

EXPOSE 3000

CMD ["node", "main.mjs"]
