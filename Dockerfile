FROM nginx as production-stage
RUN mkdir /app
COPY /github/workspace/dist /app
COPY nginx.conf /etc/nginx/nginx.conf