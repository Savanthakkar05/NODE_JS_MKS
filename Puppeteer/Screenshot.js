const puppeteer = require("puppeteer");
const path = require("path");
const generateScreenShot = async (url, outputPath) => {
  try {
    const browser = await puppeteer.launch({ headless: false });

    const page = await browser.newPage();

    await page.goto(url);

    await page.screenshot({ path: outputPath });
    console.log("Screenshot generated successfully");
    await browser.close();
  } catch (error) {
    console.error(error.message);
  }
};

const outputPath = path.resolve(__dirname, "upload/mks.png");
console.log(outputPath);
generateScreenShot("https://jsonplaceholder.typicode.com/", outputPath);
