FROM node:18-alpine

WORKDIR /usr/src/frontend

COPY package*.json ./

COPY ./src ./src
COPY ./public ./public

RUN npm install -force

EXPOSE 3000

CMD ["npm", "start"]
