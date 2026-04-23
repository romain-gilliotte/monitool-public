const request = require('supertest');

describe('Test Framework Setup', () => {
  before(async function () {
    this.timeout(15000);

    // Set required environment variables
    process.env.MONITOOL_MONGO_URI = process.env.MONITOOL_MONGO_URI || 'mongodb://localhost:27017';
    process.env.MONITOOL_REDIS_URI = process.env.MONITOOL_REDIS_URI || 'redis://localhost:6379';

    // Start test server
    await global.testServer.start();

    // Connect to test database
    await global.dbHelper.connect();
  });

  beforeEach(async function () {
    this.timeout(5000);

    // Clean database before each test
    await global.dbHelper.cleanup();

    // Reset email service stubs
    global.emailServiceStub.resetHistory();
    global.passwordResetStub.resetHistory();
  });

  after(async function () {
    this.timeout(5000);

    // Restore email service stubs
    global.emailServiceStub.restore();
    global.passwordResetStub.restore();

    // Stop server and disconnect from database
    await global.testServer.stop();
    await global.dbHelper.disconnect();
  });

  it('should have a running test server', () => {
    expect(global.testServer.server).to.exist;
  });

  it('should have database helper available', () => {
    expect(global.dbHelper).to.exist;
  });

  it('should respond to health check', async () => {
    const response = await request(global.testServer.server).get('/health/api').expect(200);

    expect(response.body).to.have.property('error', null);
  });

  it('should have mocked email service', () => {
    expect(global.emailServiceStub).to.exist;
    expect(global.passwordResetStub).to.exist;
  });
});
