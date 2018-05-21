# email-builder-from-spa using [Puppeteer](https://developers.google.com/web/tools/puppeteer/)

Build your html template with your favorite SPA framework. Then you can export any page of the SPA with this script which would make the styles inline and it will remove any script tags. I'm using full url paths to the images but that could be configured too.

1. npm install (node > 8 required)
2. run - node processTemplate 'name of the route e.g. posts' - (setup your SPA url in the file, currently http://localhost:4000)
3. the posts.html with inline styles and no scripts should be in the templates folder
