FROM node:12.13

LABEL maintainer s9443112<s9443112@gmail.com>

ENV UNIT_TEST=1

WORKDIR /app

COPY . /app

EXPOSE 8000

RUN npm i 

ENTRYPOINT ["node","src/app.js"]