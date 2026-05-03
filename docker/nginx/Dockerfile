FROM node:20-alpine AS webbuild
WORKDIR /web

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

FROM nginx:alpine
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
#frontend is served by Nginx from static files
COPY --from=webbuild /web/dist /usr/share/nginx/html 

EXPOSE 80 443
