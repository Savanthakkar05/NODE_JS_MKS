const puppeteer = require("puppeteer");

const enterFormData = async (url, searchQuery) => {
  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto(url);

    // Target selector element
    await page.focus('input[name="p"]');

    // What you would submit
    await page.keyboard.type(searchQuery);

    // Hit enter key
    await page.keyboard.press("Enter");

    await page.waitForNavigation({ waitUntil: "networkidle2" });

    await page.screenshot({ path: "query-results.png" });
    await browser.close();

    console.log("Form Data submit");
  } catch (error) {
    console.error(error.message);
  }
};

const url = "https://www.yahoo.com/";
enterFormData(url, "sunrise");
