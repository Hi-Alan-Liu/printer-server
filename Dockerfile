# 使用官方 Node.js 圖像作為基礎圖像
FROM node:16

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 9999

CMD ["node", "server.js"]