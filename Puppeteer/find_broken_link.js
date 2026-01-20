const puppeteer = require("puppeteer");

const run = async (url) => {
  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.goto(url);

    const links = await page.$$eval("a", (anchors) =>
      anchors.map((a) => a.href)
    );
    // console.log(links);

    let brokenLinks = [];
    for (const link of links) {
      const response = await page.goto(link, {
        waitUntil: "networkidle2",
        timeout: 3000,
      });

      if (response.status() >= 400) {
        brokenLinks.push({ link, status: response.status });
      }
    }

    console.log("Broken Links ", brokenLinks);
    await browser.close();
  } catch (error) {
    console.error(error.message);
  }
};

run("https://example.com/");
