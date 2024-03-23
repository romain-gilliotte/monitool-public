FROM mcr.microsoft.com/devcontainers/base:ubuntu-22.04

# Install mongo shell source
RUN wget -qO- https://www.mongodb.org/static/pgp/server-7.0.asc | tee /etc/apt/trusted.gpg.d/server-7.0.asc
RUN echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Fetch package lists
RUN apt-get update

# Install worker dependencies
RUN apt-get install -y make g++ libopencv-dev
RUN apt-get install -y graphicsmagick ghostscript
RUN apt-get install -y libreoffice

# Install mongo shell
RUN apt-get install -y mongodb-mongosh

# Install Node.js
USER vscode

ENV NVM_DIR /home/vscode/.nvm
ENV NODE_VERSION 16.20.2
RUN mkdir -p $NVM_DIR
RUN curl https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
RUN . $NVM_DIR/nvm.sh \
    && nvm install $NODE_VERSION \
    && nvm install 14.21.3 \
    && nvm alias default $NODE_VERSION \
    && nvm use default

ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH
