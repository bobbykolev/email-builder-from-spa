# email-builder-from-spa using [Puppeteer](https://developers.google.com/web/tools/puppeteer/)

Build your html template with your favorite SPA framework. Then you can export any page of the SPA with this script which would make the styles inline and it will remove any script tags. I'm using full url paths to the images but that could be configured too.

1. `npm install` (node > 8 required)
2. setup config.json
3. run - `node processTemplate` you can add an index to specify a page from the config, if not specified all pages will be crawled and built
built templates are placed in *templates* folder
