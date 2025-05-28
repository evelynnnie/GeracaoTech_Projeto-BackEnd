const request = require('supertest');
const app = require('../src/app');

describe('GET /', () => {
  it('should return "Bem-vindo à API!"', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toEqual('Bem-vindo à API!');
  });
});