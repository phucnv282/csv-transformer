FROM node:8.11.3-jessie

RUN useradd -ms /bin/bash user0

WORKDIR /app

ADD . /app

RUN chown -R user0:user0 /app

RUN npm install && npm install --global bower

USER user0

RUN bower install

EXPOSE 8000

CMD ["npm", "start"]
