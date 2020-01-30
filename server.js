const http = require('http');
const { createServer } = http;
const { app } = require('./lib/handlers');
const main = function () {
  const server = createServer(app.respond.bind(app));
  server.listen(5000, () => console.log('started listening'));
};

main();