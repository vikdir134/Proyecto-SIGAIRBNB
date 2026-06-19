const puppeteer = require('puppeteer');

const {
  generarReciboHtml
} = require('./reciboHtmlTemplate');

const generarReciboPdfBuffer = async ({
  recibo,
  detalles
}) => {
  let browser = null;

  try {
    const html = generarReciboHtml({
      recibo,
      detalles
    });

    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ]
    });

    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: 'networkidle0'
    });

    const pdfData = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '14mm',
        right: '12mm',
        bottom: '14mm',
        left: '12mm'
      }
    });

    return Buffer.from(pdfData);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

module.exports = {
  generarReciboPdfBuffer
};