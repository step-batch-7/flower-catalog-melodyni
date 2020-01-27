const stringify = function (headersText, header) {
  headersText += `${header.key}: ${header.value}\r\n`;
  return headersText;
}

class Response {
  constructor() {
    this.protocol = 'HTTP/1.1';
    this.statusCode = 404;
    this.statusMsg = 'File Not Found';
    this.headers = [];
    this.body = '';
  }

  setHeader(key, value) {
    this.headers.push({ key, value })
  }

  setSuccessCode() {
    this.statusCode = 200;
    this.statusMsg = 'OK';
  }

  addContent(content) {
    this.body = content;
  }

  writeTo(writable) {
    const response = `${this.protocol} ${this.statusCode} ${this.statusMsg}`;
    const headers = this.headers.reduce(stringify, '')
    const responseAndHeaders = `${response}\r\n${headers}\r\n`;
    writable.write(responseAndHeaders);
    writable.write(this.body);
  }
}

module.exports = { Response };
