FROM node:8.11.3-jessie as builder

RUN useradd -ms /bin/bash bebe

WORKDIR /app

ADD . /app

RUN mkdir /app/uploads && chown -R bebe:bebe /app && npm install && \
    npm install --global bower && npm cache clean --force
    
USER bebe 

RUN bower install --allow-root && bower cache clean

FROM node:8.11.3-alpine

WORKDIR /app

COPY --from=builder /app /app 

ENTRYPOINT ["npm", "start"]
