// Importing necessary modules
const fs = require('fs');  // To interact with the file system (create directories, etc.)
const { chromium } = require('playwright');  // Playwright module to control the browser

// Directory to store screenshots
const screenshotDir = './screenshots';
// Check if the directory exists, if not, create it
if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir);

// Configuration object storing website URLs and form element selectors
const config = {
  baseURL: 'http://localhost/playwrightfinal/index.php',  // URL of the page to test
  formSelectors: {  // Selectors for various form fields
    firstName: '#first_name', 
    lastName: '#last_name', 
    email: '#email', 
    phoneNumber: '#phone_number', 
    password: '#password', 
    rePassword: '#re_password', 
    dob: '#dob', 
    city: '#city', 
    state: '#state', 
    submitButton: '#submit',  // Submit button on the form
    errorMessages: '#error-messages ul li'  // Errors displayed on the form
  },
  successURL: 'http://localhost/playwrightfinal/users.php'  // URL to check if the form submission is successful
};

// Regular Expressions to validate form input
const nameRegex = /^[a-zA-Z]+$/; // Only letters (no numbers or special characters) for names
const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/; // Basic email validation
const phoneRegex = /^[0-9]{10}$/; // Phone number should be exactly 10 digits
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/; // Password should have at least 8 characters, letters and numbers

// Function to take a screenshot of the page
async function takeScreenshot(page, screenshotName) {
  await page.screenshot({ path: `${screenshotDir}/${screenshotName}.png` });
}

// Function to print error IDs if there are any form validation errors
async function printErrorIds(page) {
  const errorElements = await page.$$(config.formSelectors.errorMessages); // Find error messages on the page
  if (errorElements.length) {
    for (const errorElement of errorElements) {
      const errorId = await errorElement.getAttribute('id');  // Get the ID of the error element
      console.log(`Error ID: ${errorId}`);  // Print the error ID in the console
    }
  } else {
    console.log('✅ No error messages found.');  // No errors found
  }
}

// Function to launch the browser and open a new page
async function launchBrowser() {
  const browser = await chromium.launch({ headless: false });  // Launch the browser in non-headless mode (visible)
  const page = await browser.newPage();  // Open a new page/tab
  return { browser, page };
}

// Function to validate form data
function validateFormData(formData) {
  const errors = [];  // Array to hold any validation errors

  // Check if first name is valid
  if (!nameRegex.test(formData.firstName)) {
    errors.push("First name should only contain letters.");
  }
  // Check if last name is valid
  if (!nameRegex.test(formData.lastName)) {
    errors.push("Last name should only contain letters.");
  }
  // Check if email is valid
  if (!emailRegex.test(formData.email)) {
    errors.push("Email is not valid.");
  }
  // Check if phone number is valid
  if (!phoneRegex.test(formData.phoneNumber)) {
    errors.push("Phone number should be 10 digits.");
  }
  // Check if password is valid
  if (!passwordRegex.test(formData.password)) {
    errors.push("Password should be at least 8 characters, and include both letters and numbers.");
  }
  // Check if passwords match
  if (formData.password !== formData.rePassword) {
    errors.push("Passwords do not match.");
  }

  return errors;  // Return any validation errors
}

// Function to fill out the form with provided data
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
  await page.click(config.formSelectors.submitButton);  // Submit the form
}

// Main function to run the browser automation
(async () => {
  // Launch the browser and open a page
  const { browser, page } = await launchBrowser();
  await page.goto(config.baseURL, { waitUntil: 'domcontentloaded' });  // Go to the form page

  // Define sample form data
  const formData = {
    firstName: '#########',  // Invalid first name (should be only letters)
    lastName: 'Joshi',
    email: 'harQshit.jSsqoshi@example.com',  // Invalid email format
    phoneNumber: '9876543210',
    password: 'StrongPassword123!',
    rePassword: 'StrongPassword123!',
    dob: '2003-01-28',
    city: 'Faridabad',
    state: 'Haryana'
  };

  // Validate the form data
  const validationErrors = validateFormData(formData);

  // If there are validation errors, print them and take a screenshot
  if (validationErrors.length > 0) {
    console.log('❌ Form validation failed with errors:', validationErrors);
    await takeScreenshot(page, 'form_validation_failed');
  } else {
    // If no errors, fill out the form and submit it
    await fillForm(page, formData);
    await page.waitForTimeout(5000);  // Wait for 5 seconds to ensure the form submission is processed

    const currentURL = page.url();  // Get the current page URL after submission
    console.log(`📍 Current URL: ${currentURL}`);

    // Check if the form submission was successful
    if (currentURL === config.successURL) {
      console.log('🎉 Form submitted successfully.');
      await takeScreenshot(page, 'form_success');  // Take a screenshot of the success page
    } else {
      console.log('❌ Form submission failed.');
      const formErrorVisible = await page.locator(config.formSelectors.errorMessages).count() > 0;  // Check if errors are displayed

      // If errors are visible, print error IDs and take a screenshot
      if (formErrorVisible) {
        await printErrorIds(page);
        await takeScreenshot(page, 'form_errors_detected');
      } else {
        await takeScreenshot(page, 'unknown_issue');  // Take a screenshot if the issue is unknown
      }
    }
  }

  await browser.close();  // Close the browser after the test
})();
