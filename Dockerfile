FROM node:14

RUN mkdir /ecommerce_frontend

WORKDIR /ecommerce_frontend

COPY ./package.json /ecommerce_frontend

RUN npm install --production

COPY . /ecommerce_frontend

RUN npm run build