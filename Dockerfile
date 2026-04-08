# ── Stage 1: ビルド ────────────────────────────────────────────────────────────
FROM node:20-slim AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# VITE_ 変数はビルド時に埋め込まれる
ARG VITE_API_BASE_URL=https://avi-bot-clinic.fly.dev
ARG VITE_SITE_URL=https://avi-web.net
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_SITE_URL=${VITE_SITE_URL}

RUN npm run build

# ── Stage 2: nginx で配信 ──────────────────────────────────────────────────────
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
