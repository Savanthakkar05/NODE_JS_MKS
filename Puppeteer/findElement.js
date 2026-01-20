const puppeteer = require("puppeteer");
const run = async (url, elements) => {
  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto(url);

    const presenseResult = [];

    for (const element of elements) {
      console.log(element);
      const foundElements = await page.$$eval(element);
      presenseResult[element] = foundElements.length > 0;
    }

    console.log(presenseResult);
    await browser.close();
  } catch (error) {
    console.error(error.message);
  }
};

const elements = ["div", "#main-content", "footer"];
run("https://jsonplaceholder.typicode.com/", elements);
