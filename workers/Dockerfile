FROM node:22-alpine

WORKDIR /app
ENV LANG=C.UTF-8

RUN apk --no-cache add \
    # gm
    graphicsmagick ghostscript \
    # thumbnails
    libreoffice \
    ttf-liberation ttf-dejavu font-noto

# Install prod dependencies only
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY src src
COPY data data

EXPOSE 8000
CMD ["node", "./src/main.js"]
