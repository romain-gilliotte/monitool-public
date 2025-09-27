const request = require('supertest');
const AuthTestSetup = require('./auth-setup');

describe('User Info & Session Management', () => {
  const authSetup = new AuthTestSetup();
  const testUser = {
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User',
  };
  let authToken;

  before(async function () {
    this.timeout(15000);
    await authSetup.setupTests();
  });

  beforeEach(async function () {
    this.timeout(5000);
    await authSetup.cleanupBetweenTests();

    // Create and verify a test user
    await authSetup.createVerifiedTestUser(testUser);

    // Login to get a token
    authToken = await authSetup.loginUser(testUser.email, testUser.password);
  });

  after(async function () {
    this.timeout(5000);
    await authSetup.teardownTests();
  });

  describe('GET /me', () => {
    it('should return user info when authenticated', async () => {
      const response = await request(authSetup.app)
        .get('/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).to.have.property('user');
      expect(response.body.user).to.have.property('email', testUser.email);
      expect(response.body.user).to.have.property('name', testUser.name);
    });

    it('should reject request without authentication', async () => {
      const response = await request(authSetup.app).get('/me').expect(401);

      expect(response.body).to.have.property('error');
      expect(response.body.error).to.contain('No token provided');
    });

    it('should reject request with invalid token', async () => {
      const response = await request(authSetup.app)
        .get('/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).to.have.property('error');
    });

    it('should reject request with malformed authorization header', async () => {
      const response = await request(authSetup.app)
        .get('/me')
        .set('Authorization', 'invalid-format')
        .expect(401);

      expect(response.body).to.have.property('error');
      expect(response.body.error).to.contain('No token provided');
    });

    it('should reject request for unverified user', async () => {
      // Set user as unverified
      await global.dbHelper.db
        .collection('user')
        .updateOne({ _id: testUser.email }, { $set: { emailVerified: false } });

      const response = await request(authSetup.app)
        .get('/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(401);

      expect(response.body).to.have.property('error');
      expect(response.body.error).to.contain('Email not verified');
    });
  });

  describe('POST /logout', () => {
    it('should successfully logout', async () => {
      const response = await request(authSetup.app).post('/logout').expect(200);

      expect(response.body).to.have.property('message');
      expect(response.body.message).to.contain('Logged out successfully');
    });

    it('should allow logout without authentication', async () => {
      // Logout should succeed even without authentication
      const response = await request(authSetup.app).post('/logout').expect(200);

      expect(response.body).to.have.property('message');
      expect(response.body.message).to.contain('Logged out successfully');
    });
  });
});
