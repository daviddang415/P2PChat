FROM node:18-alpine

WORKDIR /usr/src/backend

COPY package*.json ./

COPY server.js .

RUN npm install -force

EXPOSE 5000

CMD ["npm", "start"]
