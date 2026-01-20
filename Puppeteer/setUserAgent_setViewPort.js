const puppeteer = require("puppeteer");

const run = async (url) => {
  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X 10"
    );
    await page.setViewport({ width: 375, height: 812 });
    await page.goto(url);

    await browser.close();
  } catch (error) {
    console.error(error.message);
  }
};

run("https://www.yahoo.com");
