FROM node:14-alpine
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --only=production
COPY data data
COPY src src

EXPOSE 8000
CMD node ./src/main.js
