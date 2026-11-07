FROM node:24-alpine AS build
WORKDIR /build
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
FROM nginxinc/nginx-unprivileged:alpine
ENV API_UPSTREAM=auth-usuarios:8080 DNS_RESOLVER=127.0.0.11
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=build /build/dist /usr/share/nginx/html
EXPOSE 8080
