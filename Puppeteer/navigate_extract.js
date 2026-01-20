const puppeteer = require("puppeteer");

const run = async () => {
  try {
    const browser = await puppeteer.launch({ headless: false });

    const page = await browser.newPage();

    await page.goto("https://mksdigitech.com/");

    // Extract Images
    // $$eval() method return multiple imge element
    // $eval() method return single image element
    const images = await page.$$eval("img", (element) =>
      element.map((elem) => ({
        src: elem.src,
        alt: elem.alt,
      }))
    );

    // console.log("Images : ", images);

    // Extract Link
    const link = await page.$$eval("a", (element) =>
      element.map((elem) => ({
        href: elem.href,
        text: elem.text,
      }))
    );

    // console.log("Link : ", link);

    const imagesCount = images.length;
    const linksCount = link.length;

    const output = { images, link, imagesCount, linksCount };

    console.log(output.imagesCount, output.linksCount);
    await browser.close();
  } catch (error) {
    console.error(error.message);
  }
};

run();
