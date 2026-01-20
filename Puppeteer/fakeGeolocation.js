const puppeteer = require("puppeteer");

const run = async () => {
  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    const longitude = 37.7749;
    const latitude = 122.4194;

    await page
      .browserContext()
      .overridePermissions("https://example.com", ["geolocation"]);

    await page.setGeolocation({ latitude, longitude });

    await page.goto("https://example.com");

    await page.screenshot("fakeGeolocation.png");
    await browser.close();
  } catch (error) {
    console.error(error.message);
  }
};

run();
