const { readFileSync, existsSync, statSync } = require('fs');
const { Response } = require('./response');
const { loadTemplate } = require('./viewTemplates');
const CONTENT_TYPES = require('./mimeTypes');

const STATIC_FOLDER = `${__dirname}/../public`;

const respondFileNotFound = function (path) {
  const response = new Response();
  const html = loadTemplate(path, response);
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

const handleGet = function (url) {
  const path = `${STATIC_FOLDER}/${url}`;
  const doesFileExist = existsSync(path) && statSync(path).isFile();
  if (!doesFileExist) {
    return respondFileNotFound('fileNotFound.html');
  }
  return respondWithStaticFile(path);
}

module.exports = { handleGet };