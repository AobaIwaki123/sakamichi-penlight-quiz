# --- 共通環境変数定義（再利用のため） ---
ARG NODE_VERSION=16

# --- 開発ステージ（ローカル開発やpnpm用） ---
FROM node:${NODE_VERSION}-slim AS dev

# 開発用の環境変数
ENV NODE_ENV=development

# 作業ディレクトリの作成
WORKDIR /app

# パッケージ定義ファイルのコピー
COPY package.json pnpm-lock.yaml ./

# pnpm のグローバルインストール
RUN npm install -g pnpm

# グローバルバイナリディレクトリの設定（例：`pnpm dlx`等で必要）
# RUN pnpm config set global-bin-dir /usr/local/bin

# --- 開発・ビルドステージ ---
FROM node:${NODE_VERSION}-slim AS builder

# 本番用の環境変数（ビルドはproduction設定で行う）
ENV NODE_ENV=production

# 作業ディレクトリの作成
WORKDIR /app

# パッケージファイルのコピーと依存関係のインストール（--frozen-lockfile でロックファイル厳守）
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# ソースコードのコピーとビルドの実行
COPY . .
RUN pnpm run build

# --- 本番ステージ（軽量かつ安全なDistrolessイメージ） ---
FROM gcr.io/distroless/nodejs22-debian12:nonroot AS prod

# 本番環境変数
ENV NODE_ENV=production

# 作業ディレクトリの設定（nonroot ユーザーで実行される）
WORKDIR /app

# 必要最低限のファイルのみをコピー（standaloneモード + public/static）
COPY --from=builder --chown=65532:65532 /app/.next/standalone /app/
COPY --from=builder --chown=65532:65532 /app/.next/static /app/.next/static
COPY --from=builder --chown=65532:65532 /app/public /app/public

# 環境変数とポート定義
ARG PORT=3000
ENV HOSTNAME=0.0.0.0
ENV PORT=${PORT}
EXPOSE ${PORT}

# 起動エントリーポイント（Next.jsのstandaloneサーバ）
ENTRYPOINT [ "/nodejs/bin/node", "server.js" ]
