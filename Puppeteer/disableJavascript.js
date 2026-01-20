const puppeteer = require("puppeteer");

const run = async (url) => {
  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    page.setJavaScriptEnabled(false);
    console.log("Java script is disbled");

    await page.goto(url);
    await browser.close();
  } catch (error) {
    console.error(error.message);
  }
};

run("https://www.youtube.com/");
