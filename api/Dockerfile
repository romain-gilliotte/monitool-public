###################################
# Production stage
###################################

# Switch to a clean image
FROM node:12
WORKDIR /app

# Install worker dependencies
RUN apt-get update && apt-get install -y graphicsmagick

# Install prod dependencies only
COPY package.json package-lock.json ./
RUN npm install --production
COPY src src
COPY data data

# Run monitool API
EXPOSE 8000
CMD node ./src/main.js
