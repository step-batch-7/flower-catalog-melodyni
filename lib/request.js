const collectKeyValuePairs = function (parsedHeaders, header) {
  const [key, value] = header.split(': ');
  parsedHeaders[key] = value;
  return parsedHeaders;
};

class Request {
  constructor(method, url, query, headers, body) {
    this.method = method;
    this.url = url;
    this.query = query;
    this.headers = headers;
    this.body = body;
  }

  static parse(requestText) {
    const [requestHeaders, body] = requestText.split('\r\n\r\n');
    const [request, ...headersText] = requestHeaders.split('\r\n');
    const [method, url, protocol] = request.split(' ');
    const headers = headersText.reduce(collectKeyValuePairs, {});
    return { method, url, protocol, headers, body };
  }
}

module.exports = { Request }