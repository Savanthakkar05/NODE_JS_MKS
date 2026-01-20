const puppeteer = require("puppeteer");
const device = puppeteer.KnownDevices["iPhone 13 Pro Max"]
const run = async () => {
  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.emulate(device);
    await page.goto("https://google.com");

    await page.screenshot({ path: "ipad_11.png" });
    await browser.close();
  } catch (error) {
    console.error(error.message);
  }
};

run();
