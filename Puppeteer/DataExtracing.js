const puppeteer = require("puppeteer");
const fs = require("fs");
const run = async (urls) => {
  try {
    const browser = await puppeteer.launch({ headless: false });

    const scrapingPromises = urls.map(async (url) => {
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle0' });

      const data = await page.evaluate(() => {
        const title = document.querySelector("h1").textContent.trim();
        const description = document.querySelector("p").textContent.trim();
        return { title, description };
      });

      await page.close();
      return data;
    });

    const scrappedDataArray = await Promise.all(scrapingPromises);

    const outputData = "outputdata.json";
    fs.writeFileSync(outputData, JSON.stringify(scrappedDataArray, null, 2));

    console.log("Scrapped Data : ", outputData);
    await browser.close();
  } catch (error) {
    console.error(error.message);
  }
};

const urls = [
  "https://example.org",
  "https://example.com",
  "https://example.net",
];
run(urls);
