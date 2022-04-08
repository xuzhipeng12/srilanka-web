FROM node:14.18-alpine as web-build
WORKDIR /home/srilanka-web
COPY . .
RUN npm install --registry=https://registry.npm.taobao.org
RUN npm run build:prod


FROM nginx:latest
COPY  --from=web-build   /home/srilanka-web/dist/ /usr/share/nginx/html/
