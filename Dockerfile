FROM mcr.microsoft.com/playwright:v1.16.2-focal

# Sets argument as environmental variable
ENV PLAYWRIGHT_FOLDERNAME=checkout

# Copy from current directory to `/e2e`
COPY . /e2e

# Sets working directory to `/e2e`
WORKDIR /e2e

# Install dependencies
RUN npm install
RUN npx playwright install chromium

# Run command `npx playwright test $PLAYWRIGHT_FOLDERNAME`
CMD npx playwright test ${PLAYWRIGHT_FOLDERNAME} --reporter=list
