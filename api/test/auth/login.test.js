const request = require('supertest');
const jwt = require('jsonwebtoken');
const config = require('../../src/config');
const AuthTestSetup = require('./auth-setup');

describe('User Login', () => {
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

    // Create and verify a test user for login tests
    await authSetup.createVerifiedTestUser(testUser);
  });

  after(async function () {
    this.timeout(5000);
    await authSetup.teardownTests();
  });

  describe('POST /login', () => {
    it('should successfully login with valid credentials', async () => {
      const response = await request(authSetup.app)
        .post('/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(response.body).to.have.property('token');
      expect(response.body).to.have.property('user');
      expect(response.body.user).to.have.property('email', testUser.email);
      expect(response.body.user).to.have.property('name', testUser.name);

      // Verify the JWT token is valid
      const decoded = jwt.verify(response.body.token, config.jwt.secret);
      expect(decoded).to.have.property('email', testUser.email);
      expect(decoded).to.have.property('name', testUser.name);

      // Verify lastSeen was updated
      const user = await global.dbHelper.db.collection('user').findOne({ _id: testUser.email });
      expect(user.lastSeen).to.exist;
    });

    it('should reject login with invalid email', async () => {
      const response = await request(authSetup.app)
        .post('/login')
        .send({
          email: 'nonexistent@example.com',
          password: testUser.password,
        })
        .expect(401);

      expect(response.body).to.have.property('error');
      expect(response.body.error).to.contain('Invalid email or password');
    });

    it('should reject login with invalid password', async () => {
      const response = await request(authSetup.app)
        .post('/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body).to.have.property('error');
      expect(response.body.error).to.contain('Invalid email or password');
    });

    it('should reject login for unverified email', async () => {
      // Set user as unverified
      await global.dbHelper.db
        .collection('user')
        .updateOne({ _id: testUser.email }, { $set: { emailVerified: false } });

      const response = await request(authSetup.app)
        .post('/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(401);

      expect(response.body).to.have.property('error');
      expect(response.body.error).to.contain('Please verify your email address');
    });

    it('should reject login with missing credentials', async () => {
      // Missing password
      let response = await request(authSetup.app)
        .post('/login')
        .send({
          email: testUser.email,
        })
        .expect(401);

      expect(response.body).to.have.property('error');

      // Missing email
      response = await request(authSetup.app)
        .post('/login')
        .send({
          password: testUser.password,
        })
        .expect(401);

      expect(response.body).to.have.property('error');
    });

    it('should handle case-sensitive email login', async () => {
      // Try to login with different case
      const response = await request(authSetup.app)
        .post('/login')
        .send({
          email: testUser.email.toUpperCase(),
          password: testUser.password,
        })
        .expect(401);

      expect(response.body).to.have.property('error');
      expect(response.body.error).to.contain('Invalid email or password');
    });
  });
});
