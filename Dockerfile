FROM mcr.microsoft.com/playwright:v1.16.2-focal

# Add optional build arguments, default: "checkout"
ARG PLAYWRIGHT_FOLDERNAME

# Sets argument as environmental variable
ENV PLAYWRIGHT_FOLDERNAME ${PLAYWRIGHT_FOLDERNAME:-checkout}

# Copy from current directory to `/e2e` and sets working directory to `/e2e`
COPY . /e2e
WORKDIR /e2e

# Install dependencies
RUN npm install
RUN npx playwright install

# Run `npx playwright $FOLDERNAME`
CMD [ "npx", "playwright", "test", "$PLAYWRIGHT_FOLDERNAME", "--reporter=list" ]
