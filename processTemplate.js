require("babel-core/register");
require("babel-polyfill");
const puppeteer = require("puppeteer");
const fse = require('fs-extra'); // v 5.0.0
const path = require('path');
const pretty = require('pretty');
const process = require('process');
const inlineCss = require('inline-css');
const config = require('./config');
const args = process.argv;

//check config
if (!config || !config.url || !(config.pages.length > 1)) {
  console.error('Missing configuration!');
  console.warn('You need to have url and pages in order to continue.');

  return;

} else if (args[2]) {
  buildTemplate(args[2]);
} else {
  asyncForEach(config.pages, async (page, index) => {
    if (index) {
      await buildTemplate(index);
    }
  });
}

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

async function buildTemplate(index)  {
  //launch
  const browser = await puppeteer.launch({headless: true, args: ['--disable-http2']});

  //new page and config
  const page = await browser.newPage();
  page.setExtraHTTPHeaders({ 'upgrade-insecure-requests': '0' });
  page.setDefaultNavigationTimeout(100000);

  //on css request
  const stylesheets = {};

  page.on('response', async res => {
    if (res.request().resourceType() === 'stylesheet') {
      stylesheets[res.url()] = await res.text();
    }
  });

  console.log('URL: ' + config.url + config.pages[index].path);

  //load page
  await page.goto(config.url + config.pages[index].path, {waitUntil: 'networkidle2', timeout: 0});

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
  await page.$$eval('script', scripts => {
    scripts.forEach(scr => {
      try {
        document.head.removeChild(scr);
      } catch (e) {}

      try {
        document.body.removeChild(scr);
      } catch (e) {}
    });
  });

  //remove browser sync div
  await page.evaluate(() => {
    try {
      document.body.removeChild(document.getElementById('__bs_notify__'));
    } catch (e) {}
  });

  //get page content
  let html = await page.content();

  //make styles inline
  inlineCss(html, {url: ' ',preserveMediaQueries: true}).then((inlinedHTML) => {
    html = inlinedHTML;

    //prettify html
    html = pretty(html);

    let filePath = path.resolve(`./templates/${config.pages[index].name}.html`);
    fse.outputFile(filePath, html);

    console.log(`FILE saved: - ./templates/${config.pages[index].name}.html`);
  });

  //console.log(html);
  await browser.close();
}