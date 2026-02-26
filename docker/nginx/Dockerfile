FROM node:20-alpine AS webbuild
WORKDIR /web

COPY the-social-frontend-skeleton/package*.json ./
RUN npm ci

COPY the-social-frontend-skeleton/ ./
RUN npm run build

FROM nginx:alpine
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=webbuild /web/dist /usr/share/nginx/html

EXPOSE 80 443
