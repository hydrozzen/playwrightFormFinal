const fs = require('fs'); 
const { chromium, firefox, webkit } = require('playwright');


//screenshot folder creation
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
    successMessage: '#success-message', //  success message 
    errorMessages: '#error-messages ul li', //  error message
    
  },
  successURL: 'http://localhost/form-main/users.php',
};

// Helper function for  screenshot
async function takeScreenshot(page, screenshotName) {
  await page.screenshot({ path: `./screenshots/${screenshotName}.png` }); // Save screenshot in the 'screenshots' folder
  console.log(`Screenshot saved as ${screenshotName}.png`);
}



// Function for printing error id
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

// Function to validate form
async function validateFormData(formData) {
  let isValid = true; 

  // Checking first name, last name , email not empty 
  if (!formData.firstName || !formData.lastName || !formData.email) {
    console.log('First name, last name, and email are required!');
    isValid = false;
  }

  // Checking for special char at first name ,last name
  const namePattern = /^[a-zA-Z\s]+$/;
  if (!namePattern.test(formData.firstName)) {
    console.log('First name must contain only letters and spaces.');
    isValid = false;
  }
  if (!namePattern.test(formData.lastName)) {
    console.log('Last name must contain only letters and spaces.');
    isValid = false;
  }

  // Checkng city not having number/special character 
  const cityStatePattern = /^[a-zA-Z\s]+$/;
  if (!formData.city || !cityStatePattern.test(formData.city)) {
    console.log('City must not be empty and must contain only letters and spaces.');
    isValid = false;
  }
    // Checkng city not having number/special character 
  if (!formData.state || !cityStatePattern.test(formData.state)) {
    console.log('State must not be empty and must contain only letters and spaces.');
    isValid = false;
  }

  // Checking phoneNumber of 10 digit
  const phonePattern = /^\d{10}$/;
  if (formData.phoneNumber && !phonePattern.test(formData.phoneNumber)) {
    console.log('Phone number must be exactly 10 digits.');
    isValid = false;
  }

  // Checking pasword Strenth
  if (formData.password.length < 4) {
    console.log('Password must be at least 4 characters long.');
    isValid = false;
  }

  // Checking password and repassword matches
  if (formData.password !== formData.rePassword) {
    console.log('Password and re-password must match.');
    isValid = false;
  }

// checking for bot, if honeypot filled means bot 
  if (formData.honeypotField) {
    console.log('Bot detected');
    isValid = false; 
  }
  // Checking for date of birth 
  const currentDate = new Date();
  const dob = new Date(formData.dob);
  if (dob > currentDate) {
    console.log('Date of birth cannot be in the future.');
    isValid = false;
  }

 
  return isValid;
}

async function launchBrowser() {
  const browser = await chromium.launch({ headless: false });
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
  const { browser, page } = await launchBrowser();

  //going to base url
  await page.goto(config.baseURL);

  //data that will be filled in the form 
  const formData ={ firstName: 'Harshit', lastName: 'Joshi', email: 'haahSshit.jshi@exayhmple.com', phoneNumber: '9876543210', password: 'StrongPassword123!', rePassword: 'StrongPassword123!', dob: '2003-01-28', city: 'Faridabad', state: 'Haryana' }

  ;

  // Validateing the data 
  const isValid = await validateFormData(formData);
  if (!isValid) {
    console.log('Form data is invalid. Stopping test.');
    await takeScreenshot(page, 'invalid_form_data');
    await browser.close();
    return;
  }
 

  // Filing the fornm with form dta 
  await fillForm(page, formData);

  // Checking for submision if users.php means sucess
  try {
    await page.waitForURL(config.successURL, { timeout: 10000 });
    console.log('Form submitted successfully and redirected to users.php!');

    const tableExists = await page.locator('table').isVisible();
    if (tableExists) {
      console.log('User list table found. Form submission confirmed.');//double checked here , page +table both visible
      await takeScreenshot(page, 'form_success');
    } else {
      console.log('User list table not found ,may be a  issue.');
      await takeScreenshot(page, 'users_page_issue');
    }
  } catch (error) {
    console.log('Form submission failed, staying on the form page.');

    const formErrorVisible = await page.locator(config.formSelectors.errorMessages).count() > 0;
    if (formErrorVisible) {
      console.log('Errors detected on the form page.');
      await printErrorIds(page);
      await takeScreenshot(page, 'form_errors_detected');
    } else {
      console.log('No errors detected on the page. Possible unknown issue.');
      await takeScreenshot(page, 'unknown_issue');
    }
  }

  await page.waitForTimeout(3000);
  await browser.close();
})();
