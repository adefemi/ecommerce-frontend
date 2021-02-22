FROM node:14

RUN mkdir /ec_frontend

WORKDIR /ec_frontend

COPY ./package.json /ec_frontend

RUN npm install

COPY . /ec_frontend

RUN npm run build

CMD ["npm", "start"]