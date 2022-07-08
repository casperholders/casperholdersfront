FROM node:lts as build-stage
ARG mode
WORKDIR /app
COPY package*.json pnpm-lock.yaml ./
RUN corepack enable && corepack prepare pnpm@7.5.0 --activate && pnpm install --prod --frozen-lockfile && pnpm add vite
COPY ./ .
RUN pnpm build-${mode}

FROM nginx:alpine as production-stage
RUN mkdir /app
COPY --from=build-stage /app/dist /app
COPY nginx.conf /etc/nginx/nginx.conf
