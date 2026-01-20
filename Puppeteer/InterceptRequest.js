const puppeteer = require("puppeteer");

const interceptReq = async (url) => {
  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    // If setRequestInterception is true then you manipulate request
    await page.setRequestInterception(true);

    // Logic for Interception
    page.on("request", (interceptRequest) => {
      if (interceptRequest.url().endsWith(".png ")) {
        interceptRequest.abort();
        console.log("Request Aborted");
      } else {
        interceptRequest.headers({ secretKey: "abc123" });
        interceptRequest.continue();
        console.log("Request continue with headers");
      }
    });

    await page.goto(url);
    await browser.close();

    console.log("Request Interception completed");
  } catch (error) {
    console.error(error.message);
  }
};

interceptReq("https://www.yahoo.com/");
