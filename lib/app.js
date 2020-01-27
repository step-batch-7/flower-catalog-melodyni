const { readFileSync, writeFileSync, existsSync, statSync } = require('fs');
const { Response } = require('./response');
const { loadTemplate } = require('./viewTemplates');
const CONTENT_TYPES = require('./mimeTypes');
const STATIC_FOLDER = `${__dirname}/../public`;
const DATABASE = `${__dirname}/../dataBase/comments.json`;


const setResponse = function (response, content) {
  response.setHeader('Content-Type', 'text/html');
  response.setHeader('Content-Length', content.length);
  response.addContent(content);
  return response;
}

const doesFileExist = function (path) {
  return existsSync(path) && statSync(path).isFile();
}

const getFileNotFoundPage = function (path) {
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
</html>`}

const serveFileNotFoundPage = function (path) {
  const response = new Response();
  const html = getFileNotFoundPage(path);
  return setResponse(response, html);
}

const serveStaticFile = function (path) {
  const extension = path.split('.').pop();
  const content = readFileSync(path);
  const response = new Response();
  response.setSuccessCode();
  response.setHeader('Content-Type', CONTENT_TYPES[extension]);
  response.setHeader('Content-Length', content.length);
  response.addContent(content);
  return response;
}

const collectComments = function (commentBoxes, comment) {
  commentBoxes += loadTemplate('commentBox.html', comment);
  return commentBoxes
}

const serveUpdatedGuestBook = function (comments) {
  commentBoxes = comments.reduce(collectComments, '');
  const guestBook = loadTemplate(`/../public/guestBook.html`, { comments: commentBoxes });
  const response = new Response();
  response.setSuccessCode();
  return setResponse(response, guestBook);
};

const servePreviousComments = function () {
  let comments = JSON.parse(readFileSync(DATABASE));
  return serveUpdatedGuestBook(comments);
}


const handleGet = function (request) {
  const path = `${STATIC_FOLDER}/${request.url}`;
  if (!doesFileExist(path)) {
    return serveFileNotFoundPage(request.url);
  }
  if (request.url === '/guestBook.html') {
    return servePreviousComments();
  }
  return serveStaticFile(path);
}


const serveLatestComments = function (query) {
  let comments = JSON.parse(readFileSync(DATABASE));
  query.date = new Date();
  comments.unshift(query);
  writeFileSync(DATABASE, JSON.stringify(comments), 'utf8');
  return serveUpdatedGuestBook(comments);
}

const handlePost = function (request) {
  return serveLatestComments(request.body);
}

module.exports = { handleGet, handlePost };