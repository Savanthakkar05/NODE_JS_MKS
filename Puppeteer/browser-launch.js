const puppeteer = require("puppeteer");

const run = async () => {
  try {
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: { width: 1280, height: 700 },
      slowMo: 2000,
      devtools: true,
      env: "dev",
    });

    const page = await browser.newPage();

    await page.goto("https://yahoo.com");

    const title = await page.title();

    // const heading = await page.$eval("h3", (ele) => ele.textContent);
    await browser.close();
  } catch (error) {
    console.error(error.message);
  }
};

run();
