FROM mcr.microsoft.com/devcontainers/universal:2-linux AS dev

RUN sh -c 'echo "deb [arch=amd64] https://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list'

RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -

# https://docs.cypress.io/guides/continuous-integration/introduction#Dependencies
RUN apt-get update && \
    export DEBIAN_FRONTEND=noninteractive && \
    apt-get -y install --no-install-recommends \
        libgtk2.0-0 \
        libgtk-3-0 \
        libgbm-dev \
        libnotify-dev \
        libgconf-2-4 \
        libnss3 \
        libxss1 \
        libasound2 \
        libxtst6 xauth xvfb \
        google-chrome-stable

RUN corepack enable

RUN corepack prepare pnpm@latest --activate

RUN pnpm config set enable-pre-post-scripts true
