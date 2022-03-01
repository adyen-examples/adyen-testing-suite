# Adyen Testing suite

End-to-end testing of Adyen sample applications using [Playwright](https://playwright.dev/)

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

More info on Playwright [Installation](https://playwright.dev/docs/intro) page

### Run test suite

Execute tests headless (default)

```
npx playwright test
```

Execute single test (ie matching filename)

```
npx playwright test webhook 
```

Execute tests with open browser 

```
npx playwright test --headed 
```

## Run Docker Image

### Pre-requisites

* Docker
* Start sample application on `localhost:8080`
* Make sure the sample application uses English language 

```
  # run on Mac (i.e. --platform linux/arm64/v8)
  docker run -t -i --rm --name adyen-testing-suite --network host --platform linux/arm64/v8 ghcr.io/adyen-examples/adyen-testing-suite:main
```
