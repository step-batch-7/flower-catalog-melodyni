const request = require('supertest');
const { app } = require('../lib/handlers');
const fs = require('fs');
const config = require('../config');


describe('GET', () => {
  it('should get the homepage(index.html) for path /', (done) => {
    request(app.respond.bind(app))
      .get('/')
      .set('Accept', '*/*')
      .expect(200)
      .expect('Content-Type', 'text/html', done)
      .expect('Content-Length', "874")
      .expect(/wateringJar/)
  });

  it('should get the file if requested path is valid', (done) => {
    request(app.respond.bind(app))
      .get('/abeliophyllum.html')
      .set('Accept', '*/*')
      .expect(200)
      .expect('Content-Type', 'text/html', done)
      .expect('Content-Length', "1306")
      .expect(/Abeliophyllum/)
  });

  it('should return 404 status code for a non existing url', (done) => {
    request(app.respond.bind(app))
      .get('/badPage')
      .set('Accept', '*/*')
      .expect(404, done)
  });

  it('should get guestBook page for path /guestBook.html ', (done) => {
    request(app.respond.bind(app))
      .get('/guestBook.html')
      .set('Accept', '*/*')
      .expect('Content-Type', 'text/html', done)
      .expect(/GuestBook/);
  });
});

describe('POST comment', () => {
  it('should post the comment on the guestBookPage', (done) => {
    request(app.respond.bind(app))
      .post('/guestBook')
      .send('name=Ragini&comment=Beautiful+Flowers')
      .expect('Location', '/guestBook.html')
      .expect(302, done)
  });
  after(() => {
    fs.truncateSync(config.DATABASE);
  })
});

describe('METHOD not allowed', () => {
  it('should return 405 if the requested method is not allowed', (done) => {
    request(app.respond.bind(app))
      .put('/guestBook.html')
      .expect(405, done)
  });
});
