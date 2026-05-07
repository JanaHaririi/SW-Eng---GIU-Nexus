# syntax=docker/dockerfile:1.6

# ── builder stage ─────────────────────────────────────────────
# Installs all deps (including devDependencies) and brings in the source.
# A real build step would slot in here; for plain JS we simply prune devDeps
# at the end so only production modules ship to the final image.
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY Backend ./Backend

RUN npm prune --omit=dev


# ── final stage ───────────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Bring in production deps + source from the builder.
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/Backend ./Backend

# node:20-alpine ships with an unprivileged `node` user (uid 1000).
RUN chown -R node:node /app
USER node

# server.js lives in /app/Backend so we can `CMD ["node", "server.js"]` directly.
WORKDIR /app/Backend

EXPOSE 5000

CMD ["node", "server.js"]
