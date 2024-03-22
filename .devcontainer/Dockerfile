FROM mcr.microsoft.com/vscode/devcontainers/base:ubuntu

# Fetch package updates
RUN apt-get update

# Install worker dependencies
RUN apt-get install -y make g++ libopencv-dev
RUN apt-get install -y graphicsmagick ghostscript
RUN apt-get install -y libreoffice

# Install Node.js
# RUN adduser --disabled-password --gecos '' eloims
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
