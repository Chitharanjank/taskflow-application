FROM nginx:1.27-alpine
WORKDIR /app
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY /app/dist /usr/share/nginx/html
EXPOSE 80
