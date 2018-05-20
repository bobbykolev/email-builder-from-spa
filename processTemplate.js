require("babel-core/register");
require("babel-polyfill");
const puppeteer = require("puppeteer");
const fse = require('fs-extra'); // v 5.0.0
const path = require('path');
const pretty = require('pretty');
const process = require('process');
const inlineCss = require('inline-css');

(async () => {
  const args = process.argv;

  //launch
  const browser = await puppeteer.launch({headless: true, args: ['--disable-http2']});

  //new page and config
  const page = await browser.newPage();
  page.setExtraHTTPHeaders({ 'upgrade-insecure-requests': '0' });
  page.setDefaultNavigationTimeout(100000);

  //args
  args.forEach((val, index) => {
    console.log(`${index}: ${val}`);
  });

  //on css request
  const stylesheets = {};

  page.on('response', async res => {
    if (res.request().resourceType() === 'stylesheet') {
      stylesheets[res.url()] = await res.text();
    }
  });

  //load page
  await page.goto(`http://localhost:4000/${args[2]}`, {timeout: 10000});

  //make the styles inline
  await page.$$eval('link[rel=stylesheet]', (links, content) => {
    links.forEach(link => {
      const css = content[link.href];

      if (css) {
        const style = document.createElement('style');

        style.textContent = css;
        link.replaceWith(style);
      }
    });
  }, stylesheets);

  //remove scrips
  await page.$$eval('script', (links) => {
    links.forEach(link => {
      try {
        document.html.removeChild(link);
      } catch (e) {}

      try {
        document.body.removeChild(link);
      } catch (e) {}
    });
  });

  //remove browser sync link
  await page.evaluate(() => {
    try {
      document.body.removeChild(document.getElementById('__bs_notify__'));
    } catch (e) {}
  });

  //get page content
  let html = await page.content();

  //make styles inline
  inlineCss(html, {url: 'http://',preserveMediaQueries: true}).then((inlinedHTML) => {
    html = inlinedHTML;

    //prettify html
    html = pretty(html);

    //write and save the file
    let filePath = path.resolve(`./templates/${args[2]}.html`);
    fse.outputFile(filePath, html);
  });

  //console.log(html);
  await browser.close();

})();