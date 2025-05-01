require('dotenv').config({ path: '.env.test' });
const path = require('path');
const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app'); // app is now cleanly imported without server.listen()

describe('SIP Ingest Controller', () => {
  let server;
  let agent;

  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/eu-digital-test';

    // Connect to test DB
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Start server manually on random port
    server = app.listen(0); // 0 = dynamic port
    const port = server.address().port;
    agent = request(`http://localhost:${port}`);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    if (server) server.close();
  });

  it('should process a valid SIP zip and return 201 + sipId', async () => {
    const zipPath = path.join(__dirname, 'fixtures', 'test-sip.zip'); // Make sure this exists

    const res = await agent
      .post('/api/ingest')
      .attach('sip', zipPath);

    console.log('Response:', res.status, res.body); // for debug

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('sipId');
    expect(res.body.resourcesCount).toBeGreaterThan(0);
  });
});
