FROM node:14-alpine

WORKDIR /app
ENV LANG=C.UTF-8

RUN apk --no-cache add \
    # opencv4node
    make g++ opencv-dev \
    # gm
    graphicsmagick ghostscript \
    # thumbnails
    libreoffice

# Install prod dependencies only
COPY package.json package-lock.json ./
RUN npm ci --only=production

# Install opencv
RUN npx build-opencv --binDir=/usr/bin/ --incDir /usr/include/opencv4/ --libDir /usr/lib/ --nobuild rebuild

COPY src src
COPY data data

EXPOSE 8000
CMD node ./src/main.js
