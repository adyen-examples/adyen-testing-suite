# Adyen Testing suite

End-to-end testing of Adyen sample applications using [Playwright](https://playwright.dev/)

## Pre-requisites

* Node 17+
* Run sample application on `localhost:8080`

## Install Playwright

Add Playwright dependency and install the browsers. 
```
  npm i -D @playwright/test
  # install supported browsers
  npx playwright install
```

More info on Playwright [Installation](https://playwright.dev/docs/intro) page

## Run test suite

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

