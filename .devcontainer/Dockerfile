FROM mcr.microsoft.com/devcontainers/base:ubuntu-22.04

# Install mongo shell source
RUN wget -qO- https://www.mongodb.org/static/pgp/server-7.0.asc | tee /etc/apt/trusted.gpg.d/server-7.0.asc
RUN echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Fetch package lists
RUN apt-get update

# Install worker dependencies
RUN apt-get install -y graphicsmagick ghostscript
RUN apt-get install -y libreoffice

# Install mongo shell
RUN apt-get install -y mongodb-mongosh
