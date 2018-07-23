FROM node:8.11.3

WORKDIR /app

ADD . /app

RUN npm install

EXPOSE 9000

CMD ["node", "app.js"]
