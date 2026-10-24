FROM node:20-alpine AS build 
WORKDIR /app 
COPY package*.json ./ 
RUN npm install
COPY . . 
RUN npx vite build 

FROM nginx:alpine 
COPY --from=build /app/dist /usr/share/nginx/html 
# React Router gibi sistemler için Nginx'in her zaman index.html'e yönlendirmesini sağlar
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80