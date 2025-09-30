const request = require('supertest');
const AuthTestSetup = require('./auth-setup');

describe('Email Verification', () => {
  const authSetup = new AuthTestSetup();
  const testUser = {
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User',
  };

  before(async function () {
    this.timeout(15000);
    await authSetup.setupTests();
  });

  beforeEach(async function () {
    this.timeout(5000);
    await authSetup.cleanupBetweenTests();

    // Create a test user for email verification tests
    await authSetup.createTestUser(testUser);
  });

  after(async function () {
    this.timeout(5000);
    await authSetup.teardownTests();
  });

  describe('GET /verify-email', () => {
    it('should successfully verify email with valid token', async () => {
      // Get the verification token from the database
      const token = await authSetup.getVerificationToken(testUser.email);

      const response = await request(authSetup.app).get(`/verify-email?token=${token}`).expect(200);

      expect(response.body).to.have.property('message');
      expect(response.body.message).to.contain('Email verified successfully');

      // Verify user is now verified in database
      const verifiedUser = await global.dbHelper.db
        .collection('user')
        .findOne({ _id: testUser.email });
      expect(verifiedUser.emailVerified).to.be.true;
      expect(verifiedUser.emailVerificationToken).to.not.exist;
    });

    it('should reject verification with invalid token', async () => {
      const response = await request(authSetup.app)
        .get('/verify-email?token=invalid-token')
        .expect(400);

      expect(response.body).to.have.property('error');
      expect(response.body.error).to.contain('Invalid or expired verification token');
    });

    it('should reject verification with missing token', async () => {
      const response = await request(authSetup.app).get('/verify-email').expect(400);

      expect(response.body).to.have.property('error');
      expect(response.body.error).to.contain('Verification token is required');
    });

    it('should not verify email twice with same token', async () => {
      // Get the verification token from the database
      const token = await authSetup.getVerificationToken(testUser.email);

      // First verification should succeed
      await request(authSetup.app).get(`/verify-email?token=${token}`).expect(200);

      // Second verification with same token should fail
      const response = await request(authSetup.app).get(`/verify-email?token=${token}`).expect(400);

      expect(response.body).to.have.property('error');
      expect(response.body.error).to.contain('Invalid or expired verification token');
    });
  });
});
