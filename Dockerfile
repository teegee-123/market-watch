FROM ghcr.io/puppeteer/puppeteer:16.1.0

ENV PUPPEREER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPEREER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci
RUN npm run build
COPY . .
VOLUME ["/usr/src/app"]
RUN pwd && ls -l
USER root
RUN npm run start