FROM node:20-alpine AS builder

WORKDIR /swapstore

RUN corepack enable

COPY package.json package-lock.json* bun.lockb* ./

RUN npm install

COPY . .

RUN npm run build

FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /swapstore/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 5179

CMD ["nginx", "-g", "daemon off;"]
