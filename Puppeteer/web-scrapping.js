const puppeteer = require("puppeteer");

const scrapFun = async () => {
  try {
    // launch browser
    const browser = await puppeteer.launch({ headless: false });
    // Create new blank page
    const page = await browser.newPage();

    // Navigaet the page to URL
    await page.goto("https://goonlinetools.com/online-clipboard/");

    // Get the title of the current page
    const title = await page.title();
    console.log(title);

    // Get the text of h3 from current page
    const heading = await page.$eval("h3", (element) => element.textContent);

    console.log(heading);

    // take screenshot
    await page.screenshot({ path: "web-scrap.png" });

    // Generate PDF
    await page.pdf({ path: "web-scrap.pdf", format: "A4" });

    // Close Browser
    await browser.close();

    console.log(page);
  } catch (error) {
    console.error(error.message);
  }
};

scrapFun();
