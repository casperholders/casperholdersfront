FROM node:lts as build-stage
ARG mode
WORKDIR /app
COPY package*.json pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@9.4.0 --activate && pnpm install --prod --frozen-lockfile && pnpm add vite
COPY ./ .
RUN NODE_OPTIONS=--max-old-space-size=8192 pnpm build-${mode}

FROM nginx:alpine as production-stage
RUN mkdir /app
COPY --from=build-stage /app/dist /app
COPY nginx.conf /etc/nginx/nginx.conf
