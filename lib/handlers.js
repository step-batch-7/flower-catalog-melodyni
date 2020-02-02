const { readFileSync, writeFileSync, existsSync, statSync } = require('fs');
const querystring = require('querystring');
const { App } = require('./app');
const { loadTemplate } = require('./loadTemplates');

const STATIC_FOLDER = `${__dirname}/../public`;
const CONTENT_TYPES = require('./mimeTypes');
const DATABASE = `${__dirname}/../dataBase/comments.json`;

const getNotFoundPage = function (path) {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <title>FILE NOT FOUND</title>
  </head>
  <body style="text-align: center;">
    <h1>FILE NOT FOUND</h1>
    <p>No Webpage was found for the web address ${path}</p>
    <p>HTTP ERROR 404</p>
  </body>
  </html>`;
};

const methodNotAllowed = function (request, response) {
  response.writeHead(405, 'Method Not Allowed');
  response.end();
};

const serveNotFoundPage = function (request, response) {
  response.writeHead(404, 'File Not Found');
  const notFoundPage = getNotFoundPage(request.url);
  response.setHeader('Content-Type', 'text/html');
  response.setHeader('Content-Length', notFoundPage.length);
  response.end(notFoundPage);
};

const doesFileExist = function (path) {
  return existsSync(path) && statSync(path).isFile();
};

const serveStaticPage = function (request, response, performNext) {
  const path = request.url === '/' ? '/index.html' : request.url;
  const absolutePath = `${STATIC_FOLDER}${path}`;
  if (!doesFileExist(absolutePath)) {
    performNext();
    return;
  }
  const content = readFileSync(absolutePath);
  const extension = path.split('.').pop();
  response.setHeader('Content-Type', CONTENT_TYPES[extension]);
  response.setHeader('Content-Length', content.length);
  response.end(content);
};

const readBody = function (req, res, next) {
  let data = '';
  req.on('data', (chunk) => {
    data += chunk; return data;
  });
  req.on('end', () => {
    req.body = data;
    next();
  });
};

const fillTemplate = function (comment) {
  return loadTemplate('commentBox.html', comment);
};

const collectComments = function (comments) {
  const path = '/../public/guestBook.html';
  const commentsInHtml = comments.map(fillTemplate).join('');
  return loadTemplate(path, { comments: commentsInHtml });
};

const getComments = function () {
  return JSON.parse(readFileSync(DATABASE));
};

const serveGuestBook = function (request, response) {
  const comments = getComments();
  const guestBook = collectComments(comments);
  response.setHeader('Content-Type', 'text/html');
  response.setHeader('Content-Length', guestBook.length);
  response.end(guestBook);

};

const updateGuestBook = function (request, response) {
  const newComment = querystring.parse(request.body, '&');
  newComment.date = new Date().toLocaleString();
  const comments = getComments();
  comments.unshift(newComment);
  writeFileSync(DATABASE, JSON.stringify(comments), 'utf8');
  response.statusCode = 302;
  response.setHeader('location', '/guestBook.html');
  response.end();
};

const app = new App;
app.use(readBody);
app.get('/guestBook.html', serveGuestBook);
app.get('', serveStaticPage);
app.post('/guestBook.html', updateGuestBook);
app.get('', serveNotFoundPage);
app.post('', serveNotFoundPage);
app.use(methodNotAllowed);

module.exports = { app };
