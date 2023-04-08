FROM node:alpine

RUN mkdir /var/log/analytics/ && touch /var/log/analytics/operation.log && chown -R node:node /var/log/analytics/operation.log 

ENV PYTHONUNBUFFERED=1
RUN apk add --update --no-cache python3 && ln -sf python /usr/bin/python
RUN python3 -m ensurepip
RUN pip3 install --no-cache --upgrade pip setuptools zabbix-api==0.5.5 python-dotenv
RUN apk add openssl
RUN apk add --update openssl openssl-dev libc6-compat 

WORKDIR /usr/app 

COPY package*.json ./
RUN npm install

COPY . .

RUN npm i -g prisma && prisma generate

RUN npm run build 
RUN npm run build:py

RUN cp -r /usr/app/src/scripts /usr/app/dist/scripts

EXPOSE 8081

CMD ["npm", "run", "prod"]