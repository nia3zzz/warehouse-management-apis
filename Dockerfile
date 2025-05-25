FROM node:22.14.0-alpine

WORKDIR /warehouse-management-apis

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8080

CMD [ "npm", "run", "dev" ]