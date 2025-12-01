FROM mcr.microsoft.com/playwright:v1.50.0-noble

# Sets argument as environmental variable (default value)
ENV PLAYWRIGHT_FOLDERNAME=checkout/v5

# Copy from current directory to `/e2e`
COPY . /e2e

# Sets working directory to `/e2e`
WORKDIR /e2e

# Install dependencies
RUN npm install
RUN npx playwright install

# Run command `npx playwright test $PLAYWRIGHT_FOLDERNAME`
CMD npx playwright test /tests/${PLAYWRIGHT_FOLDERNAME} --reporter=list
