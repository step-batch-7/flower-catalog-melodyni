const { readFileSync, writeFileSync, existsSync, statSync } = require('fs');
const { Response } = require('./response');
const { loadTemplate } = require('./viewTemplates');
const CONTENT_TYPES = require('./mimeTypes');

const STATIC_FOLDER = `${__dirname}/../public`;
const DATABASE = `${__dirname}/../dataBase/comments.json`;


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

const respondFileNotFound = function (path) {
  const response = new Response();
  const html = getFileNotFoundPage(path);
  response.setHeader('Content-Type', 'text/html')
  response.setHeader('Content-Length', html.length);
  response.addContent(html);
  return response;
}

const respondWithStaticFile = function (path) {
  const extension = path.split('.').pop();
  const content = readFileSync(path);
  const response = new Response();
  response.setSuccessCode();
  response.setHeader('Content-Type', CONTENT_TYPES[extension]);
  response.setHeader('Content-Length', content.length);
  response.addContent(content);
  return response;
}

const handleGet = function (request) {
  const path = `${STATIC_FOLDER}/${request.url}`;
  const doesFileExist = existsSync(path) && statSync(path).isFile();
  if (!doesFileExist) {
    return respondFileNotFound(request.url);
  }
  return respondWithStaticFile(path);
}

const respondWithComments = function (query) {
  let comments = JSON.parse(readFileSync(DATABASE));
  query.date = new Date();
  comments.unshift(query);
  writeFileSync(DATABASE, JSON.stringify(comments), 'utf8');
  return new Response();
}

const handlePost = function (request) {
  return respondWithComments(request.body);
}

module.exports = { handleGet, handlePost };