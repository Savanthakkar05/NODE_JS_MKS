const puppeteer = require("puppeteer");
const fs = require("fs");

const generateSourceCode = async (url, outputFile) => {
  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto(url);

    // Get source code
    const sourceCode = await page.content();

    // Write source code into the file
    fs.writeFileSync(outputFile, sourceCode, "utf-8");
    console.log("successfull get source code");
    await browser.close();
  } catch (error) {
    console.error(error.message);
  }
};

generateSourceCode("https://jsonplaceholder.typicode.com/", "sorcecode.html");
