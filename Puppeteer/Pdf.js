const puppeteer = require("puppeteer");

const generatePDF = async (url, outputFile) => {
  try {
    const browser = await puppeteer.launch({ headless: false });

    const page = await browser.newPage();

    await page.goto(url);

    // Generate PDF
    await page.pdf({ path: outputFile, format: "A4" });
    await browser.close();
  } catch (error) {
    console.error(error.message);
  }
};

generatePDF("https://jsonplaceholder.typicode.com/", "output.pdf");
