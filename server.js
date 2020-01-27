const { Server } = require('net');
const { Request } = require('./lib/request');
const { handleGet, handlePost } = require('./lib/handlers');

const pickHandler = function (method) {
  const handlers = {
    GET: handleGet,
    POST: handlePost
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
    const response = handler(request);
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
