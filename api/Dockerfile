###################################
# Production stage
###################################

# Switch to a clean image
FROM node:12 as build
WORKDIR /app

# Install prod dependencies only
COPY package.json package-lock.json ./
RUN npm ci --only=production
COPY src src
COPY data data

# Run monitool API
FROM node:12-alpine
WORKDIR /app

COPY --from=build /app /app
EXPOSE 8000
CMD node ./src/main.js
