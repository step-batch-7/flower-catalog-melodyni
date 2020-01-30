const { readFileSync } = require('fs');
const TEMPLATES = `${__dirname}/../templates`;

const loadTemplate = function (path, propertyBag) {
  const content = readFileSync(`${TEMPLATES}/${path}`, 'utf8');
  const keys = Object.keys(propertyBag);
  const replaceKeyByValue = function (content, key) {
    const pattern = new RegExp(`__${key}__`, 'g');
    return content.replace(pattern, propertyBag[key]);
  };
  const html = keys.reduce(replaceKeyByValue, content);
  return html;
};

module.exports = { loadTemplate };
