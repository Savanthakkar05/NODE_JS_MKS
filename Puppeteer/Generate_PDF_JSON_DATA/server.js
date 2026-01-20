const express = require("express");
const puppeteer = require("puppeteer");
const app = express();

app.use(express.json());

const createTemplate = (data) => {
  const { title, date, items } = data;

  const total = items.reduce((acc, item) => acc + item.price, 0);

  const itemsHtml = items
    .map(
      (item) => `
    <tr>
        <td>${item.name}</td>
        <td>${item.price}</td>
    </tr>
  `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { color: #333; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          .total { margin-top: 20px; font-weight: bold; text-align: right; }
        </style>
      </head>
      <body>
      <h1>${title}</h1>
      <p>Date : ${date} </p>

      <table>
      <thead>
      <tr>
      <th>Item Name</th>
      <th>Price</th>
      </tr>
      </thead>
      <tbody>
      ${itemsHtml}
      </tbody>
      </table>

      <div class'total'> Total : $${total}</div>
      </body>
      </html>
    `;
};

app.get("/generate-pdf", async (req, res) => {
  try {
    const jsonData = {
      title: "Client Invoice #1024",
      date: "2025-01-15",
      items: [
        {
          name: "Frontend Development (React)",
          price: 1200,
        },
        {
          name: "Backend API Setup (Node.js)",
          price: 850,
        },
        {
          name: "Database Integration",
          price: 300,
        },
        {
          name: "Server Deployment & Testing",
          price: 150,
        },
      ],
    };

    if (!jsonData || !jsonData.items) {
      return res.status(400).json({ message: "Invalid Data provided" });
    }

    const htmlContent = createTemplate(jsonData);

    const browser = await puppeteer.launch({ headless: "new" });

    const page = await browser.newPage();

    await page.setContent(htmlContent, { waitUntil: "domcontentloaded" });

    const buffer = await page.pdf({
      format: "A4",
      printBackground: true,
      landscape: false,
      margin: {
        top: "60px",
        bottom: "60px",
        left: "20px",
        right: "20px",
      },
      displayHeaderFooter: true,
      headerTemplate: `<div style="font-size: 12px; width: 100%; text-align: center; border-bottom: 1px solid #ddd; padding-bottom: 5px;">
          <span class="title"></span> 
          <span style="float: right; margin-right: 10px;">Generated Automatically</span>
        </div>`,
      footerTemplate: `<div style="font-size: 10px; width: 100%; text-align: right; padding-right: 20px;">
          Page <span class="pageNumber"></span> of <span class="totalPages"></span>
        </div>`,
    });

    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Length": buffer.length,
      "Content-Disposition": 'attachement; filename="invoice.pdf"',
    });

    res.send(buffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.listen(3039, () => {
  console.log("Server run on the 3039");
});
