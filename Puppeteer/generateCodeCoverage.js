const puppeteer = require("puppeteer");

const run = async (url) => {
  try {
    const browser = await puppeteer.launch({ headless: false });

    const page = await browser.newPage();

    // await page.goto(url);

    await Promise.all([
      page.coverage.startJSCoverage(),
      page.coverage.startCSSCoverage(),
    ]);

    await page.goto(url);

    const [jsCoverage, cssCoverage] = await Promise.all([
      page.coverage.stopJSCoverage(),
      page.coverage.stopCSSCoverage(),
    ]);

    let totalBytes = 0;
    let usedBytes = 0;

    for (let entry of jsCoverage) {
      totalBytes += entry.text.length;
      for (let range of entry.ranges) {
        usedBytes += range.end - range.start - 1;
      }
    }

    // for (let entry of cssCoverage) {
    //   totalBytes += entry.text.length;
    //   for (let range of entry.ranges) {
    //     usedBytes += range.end - range.start - 1;
    //   }
    // }
    console.log(totalBytes);
    console.log(usedBytes);
    browser.close();
  } catch (error) {
    console.error(error.message);
  }
};

run("https://example.com/");
