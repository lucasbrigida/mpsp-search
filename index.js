"use strict";

const puppeteer = require("puppeteer");
const path = require("path");
// const Tesseract = require("tesseract.js");
// const OCRAD = require("ocrad.js");
// const Canvas = require("canvas");
// const Image = Canvas.Image;
const fs = require("fs");
const inquirer = require("inquirer");
const term = require("terminal-kit");

(async () => {
  try {
    const args = process.argv;
    const keyword = args[2];

    console.log(`Buscando por: ${keyword}`);

    if (!keyword) {
      return console.log("Uso: npm start -s empresaXPTO");
    }

    const browser = await puppeteer.launch({
      headless: true,
      executablePath:
        "C:\\\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
    });
    const page = await browser.newPage();
    await page.goto("https://www.jucesponline.sp.gov.br/pesquisa.aspx");
    await page.type(
      "#ctl00_cphContent_frmBuscaSimples_txtPalavraChave",
      keyword,
      {
        delay: 100
      }
    );
    await page.click("#ctl00_cphContent_frmBuscaSimples_btPesquisar");
    await page.waitFor("#ctl00_cphContent_gdvResultadoBusca_pnlCaptcha");

    const [x, y] = await page.$eval(
      "#ctl00_cphContent_gdvResultadoBusca_pnlCaptcha img",
      el => [el.x, el.y]
    );

    await page.screenshot({
      path: `${path.resolve(__dirname, "./captcha.png")}`,
      clip: { x, y, width: 180, height: 50 }
    });

    await term.terminal.drawImage("captcha.png");

    // var captchaImg = fs.readFileSync(
    //   `${path.resolve(__dirname, "./captcha.png")}`
    // );

    // Tesseract.recognize(captchaImg, { lang: "eng" })
    //   .progress(function(message) {
    //     console.log("progress is: ", message);
    //   })
    //   .then(function(result) {
    //     console.log(result);
    //   });

    // fs.readFile(`${path.resolve(__dirname, "./captcha.png")}`, function(
    //   err,
    //   src
    // ) {
    //   if (err) {
    //     throw err;
    //   }

    //   var img = new Image();
    //   img.src = src;
    //   var canvas = new Canvas.createCanvas(img.width, img.height);
    //   var ctx = canvas.getContext("2d");
    //   ctx.drawImage(img, 0, 0, img.width, img.height);
    //   console.log(OCRAD(canvas));
    // });

    const { captcha } = await inquirer.prompt([
      { name: "captcha", message: "Informe o captcha:", type: "input" }
    ]);

    await page.type(
      'input[name="ctl00$cphContent$gdvResultadoBusca$CaptchaControl1"]',
      captcha,
      { delay: 100 }
    );

    await page.click("#ctl00_cphContent_gdvResultadoBusca_btEntrar", {
      delay: 300
    });

    await page.waitForSelector(
      "#ctl00_cphContent_gdvResultadoBusca_gdvContent"
    );

    const showing = await page.$eval(
      "#ctl00_cphContent_gdvResultadoBusca_pgrGridView_lblResults",
      el => el.textContent
    );

    const total = await page.$eval(
      "#ctl00_cphContent_gdvResultadoBusca_pgrGridView_lblResultCount",
      el => el.textContent
    );

    const results = await page.$$eval(
      "#ctl00_cphContent_gdvResultadoBusca_gdvContent tr:not(:first-child)",
      elems => {
        return Array.from(elems)
          .map(item =>
            Array.from(item.childNodes)
              .map(el => el.innerText)
              .filter(val => Boolean(val))
              .map(item => String(item).trim())
          )
          .map(item => ({
            nire: item[0],
            empresa: item[1],
            municipio: item[2]
          }));
      }
    );

    fs.writeFileSync(
      `${path.resolve(__dirname, "./out.json")}`,
      JSON.stringify(results)
    );

    console.table(results);
    console.log(`${showing} (Total: ${total})`);

    await browser.close();
  } catch (error) {
    console.error(error);
  }
})();
