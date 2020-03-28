###################################
# Production stage
###################################

# Switch to a clean image
FROM node:12 as production
WORKDIR /app

# Install prod dependencies only
COPY package.json package-lock.json ./
RUN npm install --production
COPY src src

# Run monitool API
EXPOSE 80
CMD node ./dist/main-webapp.js
