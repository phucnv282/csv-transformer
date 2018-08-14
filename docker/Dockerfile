<<<<<<< HEAD
FROM node:8.11.3-alpine as builder

WORKDIR /app

ADD . /app

RUN mkdir /app/uploads && npm install

FROM alpine:latest

WORKDIR /app

COPY --from=builder /usr/local/bin/node  /usr/bin
COPY --from=builder /usr/lib/libgcc* /usr/lib/libstdc* /usr/lib/
COPY --from=builder /app .
 
EXPOSE 8000

CMD ["node", "app.js"]
