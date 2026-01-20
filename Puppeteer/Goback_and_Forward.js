const puppeteer = require("puppeteer");
const run = async () => {
  try {
    const browser = await puppeteer.launch({ headless: false });

    const page = await browser.newPage();

    await page.goto("https://google.com");

    await page.goto("https://example.com");

    await page.goBack();

    // Operation here

    const title = await page.title();
    console.log(title);

    await page.goForward();

    browser.close();
  } catch (error) {
    console.error(error.message);
  }
};

run();