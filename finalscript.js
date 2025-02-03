const fs = require('fs');
const {chromium}=require('playwright');

const screenshotdir='./screenshotofplaywright';
if(!fs.existsSync(screenshotdir)) fs.mkdirSync(screenshotdir);

const config ={
    baseurl: 'http://localhost/playwrightfinal/index.php',
    formselectors:{
        firstname:'#first_name',
        lastname:'#last_name',
        email:'#email',
        mobile:'#phone_number',
        password:'#password',
        repassword:'#re_password',
        dob:'#dob',
        city:'#city',
        state:'#state',
        submitbtn:'#submit',
        errormessages:'#error-messages ul li'

    },
    succesurl:'http://localhost/playwrightfinal/users.php'
}
const  nameRegex = /^[a-zA-z]+$/;
const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
const phoneRegex = /^[0-9]{10}$/;
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{4,}$/;

async function takescreenshot(page,screenshotName) {
    await page.screenshot({path:`${screenshotdir}/${screenshotName}.png`});
       
}
async function printErrorIds(page){
    const errorElements =   await page.$$(config.formselectors.errormessages);
    if(errorElements.length){
        for(const errorElement of errorElements){
            const errorId = await errorElement.getAttribute('id');
            console.log(`Error id: ${errorId}`);

        }

    }
    else{
        console.log('no eroor found ');

    }
}


async function launcgBrowser() {
    const browser =await chromium.launch({headless:false});

    const page = await browser.newPage();

    return{browser,page};
    
}

//functions for  vakidations 

function validateFormData(formdata){
    const eroors = []//array
    
if (!nameRegex.test(formdata.firstname)){
    eroors.push("first sname should only have letters");
}
if (!nameRegex.test(formdata.lastname)){
    eroors.push("lst name should be have letters only ");
}
if(!emailRegex.test(formdata.email)){
    eroors.push("mail is not valid ");
}
if (!phoneRegex.test(formdata.mobile));{
    eroors.push("phone no error");
}
if(!passwordRegex.test(formdata.password)){
    eroors.push("password should be at least 4 chars long ")

}
if (formdata.password !== formdata.repassword){
    eroors.push("password not matches ");
}
return eroors;

}
async function fillForm(page,formdata) {
    await page.fill(config.formselectors.firstname,formdata.firstname);
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