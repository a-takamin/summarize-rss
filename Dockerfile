# syntax=docker/dockerfile:1@sha256:4edf897a3ffa55b89f906fc8cc78afdb3f1834cc9c7083565e611a8a7d5fe99e

FROM node:22-slim@sha256:c3de60bf2f9dd0ac6370e6117950ff62d6e339527e7472301c9c78a017978392 AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

# 依存関係のインストール + ビルド + 本番依存のみ再インストール
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=pnpm-lock.yaml,target=pnpm-lock.yaml \
    --mount=type=bind,source=tsconfig.json,target=tsconfig.json \
    --mount=type=bind,source=src,target=src \
    --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile && \
    pnpm run build && \
    pnpm prune --prod

# 実行ステージ
FROM node:22-slim@sha256:c3de60bf2f9dd0ac6370e6117950ff62d6e339527e7472301c9c78a017978392 AS runner

WORKDIR /app

USER node

COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node package.json ./

CMD ["node", "dist/index.js"]
