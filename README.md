# Adyen Testing suite

End-to-end testing of Adyen sample applications using [Playwright](https://playwright.dev/).

It can be executed in 2 ways:
- Install and run Playwright tests on Node
- Run the `ghcr.io/adyen-examples/adyen-testing-suite` Docker image

**Note:** The E2E Testing Suite supports Checkout testing with both Adyen Drop-in v5 and v6.

## Run in Node

### Pre-requisites

* Node 20+
* Start sample application on `localhost:8080`
* Make sure the sample application uses English language

### Install Playwright

Add Playwright dependency and install the browsers. 
```
  npm i -D @playwright/test
  # install supported browsers
  npx playwright install
```

More info on Playwright [Installation](https://playwright.dev/docs/intro) page.

### Env variables

The webhook tests require the HMAC Key used by the application to sign the webhook payloads

Create `.env` file 

```properties
# set the same key used by the application being tested
ADYEN_HMAC_KEY = enter your HMAC key here

```

You have 2 options to use this testing suite:

* Execute tests directly
* Execute the test from a Docker container
  

## Execute tests directly

Execute all tests headless (default)

```
npx playwright test
```

Execute single test (i.e. matching filename)

```
npx playwright test webhook 
```

Execute tests in folder (i.e. matching foldername)

```
npx playwright test ./checkout 
```

Execute tests with open browser 

```
npx playwright test --headed 
```

Run the test in UI Mode (visual recorder of each step)
```
npx playwright test --ui
```

## Execute the test from a Docker container

Run the adyen-testing-suite in a Docker container which connects to the localhost application.

Note: the localhost application will resolve to `http://docker:8080` from inside the Docker container.


### Pre-requisites

* Docker
* Start sample application on `localhost:8080`
* Make sure the sample application uses English language 
* Add `http://docker:8080` to Allow origins


```
  # Run on Mac (i.e. --platform linux/arm64/v8)
  # NOTE!! Set <host IP address> before executing docker run
  docker run -t -i --rm --name adyen-testing-suite -e URL=http://docker:8080 -e PLAYWRIGHT_FOLDERNAME=checkout --add-host=docker:<host IP address> --platform linux/arm64/v8 ghcr.io/adyen-examples/adyen-testing-suite:main
```
