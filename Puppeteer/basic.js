const puppeteer = require("puppeteer");
const puppeteerFunc = async () => {
  try {
    // launch browser
    const browser = await puppeteer.launch({ headless: true });
    // Create a new blank page
    const page = await browser.newPage();

    // Navigate the page to URL
    await page.goto("https://mksdigitech.com/");

    // Take a screenshot
    await page.screenshot({ path: "upload/google.png" });

    // close browser
    await browser.close();
  } catch (error) {
    console.log(error.message);
  }
};

puppeteerFunc();
