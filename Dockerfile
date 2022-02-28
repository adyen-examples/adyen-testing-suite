FROM mcr.microsoft.com/playwright:v1.16.2-focal

# copy project
COPY . /e2e

WORKDIR /e2e

# Install dependencies
RUN npm install
RUN npx playwright install

# Run playwright test
CMD [ "npx", "playwright", "test", "--reporter=list" ]
