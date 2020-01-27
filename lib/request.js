const collectKeyValuePairs = function (parsedHeaders, header) {
  const [key, value] = header.split(': ');
  parsedHeaders[key] = value;
  return parsedHeaders;
};

const collectParameter = function (query, keyValue) {
  const [key, value] = keyValue.split('=');
  query[key] = decodeURIComponent(value).replace('+', ' ');
  return query;
}

const parseParameters = function (body) {
  return body.split('&').reduce(collectParameter, {});
}

class Request {
  constructor(method, url, protocol, headers, body) {
    this.method = method;
    this.url = url;
    this.protocol = protocol;
    this.headers = headers;
    this.body = body;
  }

  static parse(requestText) {
    let [requestHeaders, body] = requestText.split('\r\n\r\n');
    const [request, ...headersText] = requestHeaders.split('\r\n');
    const [method, url, protocol] = request.split(' ');
    const headers = headersText.reduce(collectKeyValuePairs, {});
    if (headers['Content-Type'] === 'application/x-www-form-urlencoded') {
      body = parseParameters(body);
    }
    return { method, url, protocol, headers, body };
  }
}

module.exports = { Request }