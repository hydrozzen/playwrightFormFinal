const fs = require('fs'); // Ensure fs is imported for directory creation
const { chromium, firefox, webkit } = require('playwright');
const { expect } = require('@playwright/test'); // Importing Playwright Test's expect

// Ensure the screenshots folder exists
if (!fs.existsSync('./screenshots')) {
  fs.mkdirSync('./screenshots');
}

// Configurations
const config = {
  baseURL: 'http://localhost/form-main/',
  formSelectors: {
    firstName: '#first_name',
    lastName: '#last_name',
    email: '#email',
    phoneNumber: '#phone_number',
    password: '#password',
    rePassword: '#re_password',
    dob: '#dob',
    city: '#city',
    state: '#state',
    submitButton: '#submit',
    successMessage: '#success-message',
    errorMessages: '#error-messages ul li',
    duplicateEmailError: '#email_duplicate_error',
  },
  successURL: 'http://localhost/form-main/users.php',
};

// Helper function to take a screenshot
async function takeScreenshot(page, screenshotName) {
  await page.screenshot({ path: `./screenshots/${screenshotName}.png` });
  console.log(`Screenshot saved as ${screenshotName}.png`);
}

// Function to print error message IDs
async function printErrorIds(page) {
  const errorElements = await page.$$(config.formSelectors.errorMessages);
  if (errorElements.length > 0) {
    console.log('Form has the following error message IDs:');
    for (const errorElement of errorElements) {
      const errorId = await errorElement.getAttribute('id');
      console.log(`Error ID: ${errorId}`);
    }
  } else {
    console.log('No error messages found.');
  }
}

// Function to validate form fields before submission
async function validateFormData(formData) {
  let isValid = true;
  const namePattern = /^[a-zA-Z\s]+$/;
  const cityStatePattern = /^[a-zA-Z\s]+$/;
  const phonePattern = /^\d{10}$/;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Form validation logic
  if (!formData.firstName || !formData.lastName || !formData.email) {
    console.log('First name, last name, and email are required!');
    isValid = false;
  }
  if (!namePattern.test(formData.firstName)) {
    console.log('First name must contain only letters and spaces.');
    isValid = false;
  }
  if (!namePattern.test(formData.lastName)) {
    console.log('Last name must contain only letters and spaces.');
    isValid = false;
  }
  if (!formData.city || !cityStatePattern.test(formData.city)) {
    console.log('City must not be empty and must contain only letters and spaces.');
    isValid = false;
  }
  if (!formData.state || !cityStatePattern.test(formData.state)) {
    console.log('State must not be empty and must contain only letters and spaces.');
    isValid = false;
  }
  if (formData.phoneNumber && !phonePattern.test(formData.phoneNumber)) {
    console.log('Phone number must be exactly 10 digits.');
    isValid = false;
  }
  if (formData.password.length < 4) {
    console.log('Password must be at least 4 characters long.');
    isValid = false;
  }
  if (formData.password !== formData.rePassword) {
    console.log('Password and re-password must match.');
    isValid = false;
  }
  if (!emailPattern.test(formData.email)) {
    console.log('Email format is invalid.');
    isValid = false;
  }
  if (formData.honeypotField) {
    console.log('Bot detected');
    isValid = false;
  }
  const currentDate = new Date();
  const dob = new Date(formData.dob);
  if (dob > currentDate) {
    console.log('Date of birth cannot be in the future.');
    isValid = false;
  }

  return isValid;
}

// Refactored launchBrowser function that accepts a browser type
async function launchBrowser(browserType) {
  let browser;
  if (browserType === 'chromium') {
    browser = await chromium.launch({ headless: false });
  } else if (browserType === 'firefox') {
    browser = await firefox.launch({ headless: false });
  } else if (browserType === 'webkit') {
    browser = await webkit.launch({ headless: false });
  }
  const page = await browser.newPage();
  return { browser, page };
}

async function fillForm(page, formData) {
  await page.fill(config.formSelectors.firstName, formData.firstName);
  await page.fill(config.formSelectors.lastName, formData.lastName);
  await page.fill(config.formSelectors.email, formData.email);
  await page.fill(config.formSelectors.phoneNumber, formData.phoneNumber);
  await page.fill(config.formSelectors.password, formData.password);
  await page.fill(config.formSelectors.rePassword, formData.rePassword);
  await page.fill(config.formSelectors.dob, formData.dob);
  await page.fill(config.formSelectors.city, formData.city);
  await page.fill(config.formSelectors.state, formData.state);
  await page.click(config.formSelectors.submitButton);
}

(async () => {
  // Prepare form data
  const formData = {
    firstName: 'Harshit',
    lastName: 'Joshi',
    email: 'haahSshit.jshi@example.com',
    phoneNumber: '9876543210',
    password: 'StrongPassword123!',
    rePassword: 'StrongPassword123!',
    dob: '2003-01-28',
    city: 'Faridabad',
    state: 'Haryana',
    honeypotField: 'gsu',
  };

  // List of browsers to test
  const browsers = ['chromium', 'firefox', 'webkit'];

  for (const browserType of browsers) {
    console.log(`Testing with ${browserType}...`);

    const { browser, page } = await launchBrowser(browserType);

    // Go to the form page
    await page.goto(config.baseURL);

    // Validate form data
    const isValid = await validateFormData(formData);
    if (!isValid) {
      console.log('Form data is invalid. Stopping test.');
      await takeScreenshot(page, `${browserType}_invalid_form_data`);
      await browser.close();
      continue;
    }

    // Fill and submit the form
    await fillForm(page, formData);

    // Check for redirection or errors
    try {
      await page.waitForURL(config.successURL, { timeout: 10000 });
      console.log('Form submitted successfully and redirected to users.php!');
      const tableExists = await page.locator('table').isVisible();
      if (tableExists) {
        console.log('User list table found. Form submission confirmed.');
        await takeScreenshot(page, `${browserType}_form_success`);
      } else {
        console.log('User list table not found. There may be an issue.');
        await takeScreenshot(page, `${browserType}_users_page_issue`);
      }
    } catch (error) {
      console.log('Form submission failed, staying on the form page.');
      const formErrorVisible = await page.locator(config.formSelectors.errorMessages).count() > 0;
      if (formErrorVisible) {
        console.log('Errors detected on the form page.');
        await printErrorIds(page);
        await takeScreenshot(page, `${browserType}_form_errors_detected`);
      } else {
        console.log('No errors detected on the page. Possible unknown issue.');
        await takeScreenshot(page, `${browserType}_unknown_issue`);
      }
    }

    await page.waitForTimeout(3000);
    await browser.close();
  }
})();
