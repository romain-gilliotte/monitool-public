const request = require('supertest');

/**
 * Shared test setup for authentication tests
 */
class AuthTestSetup {
  constructor() {
    this.app = null;
  }

  async setupTests() {
    // Start test server
    this.app = await global.testServer.start();

    // Connect to test database
    await global.dbHelper.connect();
  }

  async cleanupBetweenTests() {
    // Clean database before each test
    await global.dbHelper.cleanup();

    // Reset email service stubs
    global.emailServiceStub.resetHistory();
    global.passwordResetStub.resetHistory();
  }

  async teardownTests() {
    // Stop server and disconnect from database
    await global.testServer.stop();
    await global.dbHelper.disconnect();
  }

  /**
   * Create a test user via registration endpoint
   */
  async createTestUser(userData = {}) {
    const defaultUser = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    const user = { ...defaultUser, ...userData };
    await request(this.app).post('/register').send(user);
    return user;
  }

  /**
   * Create and verify a test user
   */
  async createVerifiedTestUser(userData = {}) {
    const user = await this.createTestUser(userData);

    // Verify the user's email (simulate email verification)
    await global.dbHelper.db.collection('user').updateOne(
      { _id: user.email },
      {
        $set: { emailVerified: true },
        $unset: { emailVerificationToken: 1 },
      }
    );

    return user;
  }

  /**
   * Login a user and return the token
   */
  async loginUser(email, password) {
    const loginResponse = await request(this.app).post('/login').send({
      email,
      password,
    });

    return loginResponse.body.token;
  }

  /**
   * Get verification token for a user
   */
  async getVerificationToken(email) {
    const user = await global.dbHelper.db.collection('user').findOne({ _id: email });
    return user?.emailVerificationToken;
  }
}

module.exports = AuthTestSetup;
