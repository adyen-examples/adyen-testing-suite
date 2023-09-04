# Adyen Testing suite

End-to-end testing of Adyen sample applications using [Playwright](https://playwright.dev/).

It can be executed in 2 ways:
- Install and run Playwright tests on Node
- Run the `ghcr.io/adyen-examples/adyen-testing-suite` Docker image

## Run in Node

### Pre-requisites

* Node 17+
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


### Run test suite

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

## Run Docker Image

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


## Run in Gitpod

Run the testing-suite in Gitpod by pointing the `baseUrl` of our test configuration to the public URL of the application.

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/adyen-examples/adyen-testing-suite)

There are two ways to run the tests:

1. Run the following command with the URL set to the public URL of the application.
```
URL=https://8080-adyenexampl-adyendotnet-1xxxxxxxxxx.ws-eu88.gitpod.io npx playwright test ./checkout
```

2. Modify the `playwright.config.js` file and replace `http://localhost:8080` with the public URL of the application. After modifying the URL, (re)run the command `npx playwright install`, followed by `npx playwright test ./checkout`.
```
# See 'http://localhost:8080' in playwright.config.js
baseURL: process.env.URL || 'http://localhost:8080'
```
