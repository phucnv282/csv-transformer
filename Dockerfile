FROM node:8.11.3-jessie

WORKDIR /app

ADD . /app

RUN mkdir /app/uploads

RUN npm install && npm install --global bower

RUN bower install --allow-root

EXPOSE 8000

CMD ["npm", "start"]
