class App {
  constructor() {
    this.routes = [];
  }

  get(path, handler) {
    this.routes.push({ path, handler, method: 'GET' });
  }

  post(path, handler) {
    this.routes.push({ path, handler, method: 'POST' });
  }

  use(middleware) {
    this.routes.push({ handler: middleware });
  }

  respond(request, response) {
    console.log(request.method, request.url);
    const handlers = this.routes.filter(route => matchRoute(route, request));
    const performNext = function () {
      if (handlers.length === 0) return;
      const router = handlers.shift();
      router.handler(request, response, performNext);
    };
    performNext();
  }
}

const matchRoute = function (route, request) {
  if (route.method) {
    return route.method === request.method && request.url.match(route.path);
  }
  return true;
};

module.exports = { App };
