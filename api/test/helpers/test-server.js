const { start } = require('../../src/main');

class TestServer {
  constructor() {
    this.server = null;
    this.closeFunction = null;
  }

  async start() {
    if (this.server) {
      return this.server;
    }

    // Set test environment variables
    process.env.NODE_ENV = 'test';
    process.env.MONITOOL_PORT = '0'; // Use random available port
    process.env.MONITOOL_CLUSTER = 'false'; // Disable clustering in tests
    process.env.MONITOOL_JWT_SECRET = 'test-jwt-secret';
    process.env.MONITOOL_SESSION_SECRET = 'test-session-secret';
    process.env.MONITOOL_MONGO_DB = 'monitool_test';
    process.env.MONITOOL_DEBUG = 'false';

    // Mock AWS credentials for email service (tests will mock email sending)
    process.env.MONITOOL_AWS_ACCESS_KEY_ID = 'test-key';
    process.env.MONITOOL_AWS_SECRET_ACCESS_KEY = 'test-secret';

    this.closeFunction = await start();
    this.server = this.closeFunction.server;

    return this.server;
  }

  async stop() {
    if (this.closeFunction) {
      await this.closeFunction();
      this.closeFunction = null;
      this.server = null;
    }
  }

  getBaseUrl() {
    if (!this.server) {
      throw new Error('Server not started');
    }
    const address = this.server.address();
    return `http://localhost:${address.port}`;
  }
}

module.exports = TestServer;
