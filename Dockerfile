# syntax=docker/dockerfile:1

FROM node:22-slim AS builder

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
FROM node:22-slim AS runner

WORKDIR /app

USER node

COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/node_modules ./node_modules
COPY --chown=node:node package.json ./

CMD ["node", "dist/index.js"]
