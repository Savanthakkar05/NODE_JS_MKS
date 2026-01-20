const puppeteer = require("puppeteer");
const device0 = puppeteer.KnownDevices["iPhone 11"];
const device1 = puppeteer.KnownDevices["Galaxy Note II"];
const device2 = puppeteer.KnownDevices["Galaxy S8"];
const device3 = puppeteer.KnownDevices["BlackBerry Z30"];
const device4 = puppeteer.KnownDevices["iPad (gen 6)"];
const device5 = puppeteer.KnownDevices["Nokia Lumia 520"];
const device6 = puppeteer.KnownDevices["JioPhone 2"];
const device7 = puppeteer.KnownDevices["Moto G4"];
const device8 = puppeteer.KnownDevices["Blackberry PlayBook"];
const device9 = puppeteer.KnownDevices["LG Optimus L70 landscape"];

const devices = [
  device0,
  device1,
  device2,
  device3,
  device4,
  device5,
  device6,
  device7,
  device8,
  device9,
];

const run = async () => {
  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    for (let i = 0; i < devices.length; i++) {
      await page.emulate(devices[i]);
      await page.goto("https://google.com");
      await page.screenshot({ path: `screenshots/${i}.png` });
    }

    await browser.close();
  } catch (error) {
    console.error(error.message);
  }
};

run();