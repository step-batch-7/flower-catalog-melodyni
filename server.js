const { Server } = require('net');
const { readFileSync, existsSync, statSync } = require('fs');
const { Request } = require('./lib/request');
const { Response } = require('./lib/response');
const { loadTemplate } = require('./lib/viewTemplates');

const TEMPLATES = `${__dirname}/templates`;
const STATIC_FOLDER = `${__dirname}/public`;
const CONTENT_TYPES = {
  txt: 'text/plain',
  html: 'text/html',
  css: 'text/css',
  js: 'application/javascript',
  json: 'application/json',
  gif: 'image/gif',
};

const serveFileNotFoundPage = function (path) {
  const response = new Response();
  const html = loadTemplate(path, response);
  response.setHeader('Content-Type', html.length);
  response.addContent(html);
  return response;
}

const handleGet = function (url) {
  const path = `${STATIC_FOLDER}/${url}`;
  const doesFileExist = existsSync(path) && statSync(path).isFile();
  if (!doesFileExist) {
    return serveFileNotFoundPage('fileNotFound.html');
  }
  const extension = path.split('.').pop();
  const content = readFileSync(path);
  const response = new Response();
  response.setSuccessCode();
  response.setHeader('Content-Type', CONTENT_TYPES[extension]);
  response.setHeader('Content-Length', content.length);
  response.addContent(content);
  return response;
}

const pickHandler = function (method) {
  const handlers = {
    GET: handleGet
  }
  return handlers[method];
}

const handleConnection = function (socket) {
  const remote = `${socket.remoteAddress}:${socket.remotePort}`;
  socket.setEncoding('utf-8');
  socket.on('data', text => {
    console.warn(`${remote}: Data\n${text}`);
    const { method, url, protocol, headers, body } = Request.parse(text);
    const request = new Request(method, url, protocol, headers, body);
    const handler = pickHandler(request.method);
    const response = handler(request.url);
    response.writeTo(socket);
  });
};

const main = function () {
  const server = new Server();
  server.on('error', err => console.error('error occurred', err));
  server.on('connection', handleConnection);
  server.on('listening', () => console.log('started listening'));
  server.listen(5000);
};
main();
