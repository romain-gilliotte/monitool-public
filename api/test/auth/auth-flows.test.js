const request = require('supertest');
const AuthTestSetup = require('./auth-setup');

describe('Complete Authentication Flows', () => {
  const authSetup = new AuthTestSetup();
  const newUser = {
    email: 'complete-flow@example.com',
    password: 'securepassword123',
    name: 'Complete Flow User',
  };

  before(async function () {
    this.timeout(15000);
    await authSetup.setupTests();
  });

  beforeEach(async function () {
    this.timeout(5000);
    await authSetup.cleanupBetweenTests();
  });

  after(async function () {
    this.timeout(5000);
    await authSetup.teardownTests();
  });

  describe('Full User Journey', () => {
    it('should complete full registration and login flow', async () => {
      // Step 1: Register
      const registerResponse = await request(authSetup.app)
        .post('/register')
        .send(newUser)
        .expect(201);

      expect(registerResponse.body.message).to.contain('Registration successful');

      // Step 2: Verify email
      const verificationToken = await authSetup.getVerificationToken(newUser.email);

      const verifyResponse = await request(authSetup.app)
        .get(`/verify-email?token=${verificationToken}`)
        .expect(200);

      expect(verifyResponse.body.message).to.contain('Email verified successfully');

      // Step 3: Login
      const loginResponse = await request(authSetup.app)
        .post('/login')
        .send({
          email: newUser.email,
          password: newUser.password,
        })
        .expect(200);

      expect(loginResponse.body).to.have.property('token');
      expect(loginResponse.body.user.email).to.equal(newUser.email);

      // Step 4: Access protected endpoint
      const meResponse = await request(authSetup.app)
        .get('/me')
        .set('Authorization', `Bearer ${loginResponse.body.token}`)
        .expect(200);

      expect(meResponse.body.user.email).to.equal(newUser.email);
      expect(meResponse.body.user.name).to.equal(newUser.name);

      // Step 5: Logout
      await request(authSetup.app).post('/logout').expect(200);
    });

    it('should prevent login before email verification', async () => {
      // Register user
      await request(authSetup.app).post('/register').send(newUser).expect(201);

      // Try to login without verifying email
      const loginResponse = await request(authSetup.app)
        .post('/login')
        .send({
          email: newUser.email,
          password: newUser.password,
        })
        .expect(401);

      expect(loginResponse.body.error).to.contain('Please verify your email address');
    });

    it('should maintain user state after verification and login', async () => {
      // Register and verify user
      await request(authSetup.app).post('/register').send(newUser).expect(201);

      const verificationToken = await authSetup.getVerificationToken(newUser.email);
      await request(authSetup.app).get(`/verify-email?token=${verificationToken}`).expect(200);

      // Login
      const loginResponse = await request(authSetup.app)
        .post('/login')
        .send({
          email: newUser.email,
          password: newUser.password,
        })
        .expect(200);

      const token = loginResponse.body.token;

      // Verify user info endpoint works multiple times
      for (let i = 0; i < 3; i++) {
        const meResponse = await request(authSetup.app)
          .get('/me')
          .set('Authorization', `Bearer ${token}`)
          .expect(200);

        expect(meResponse.body.user.email).to.equal(newUser.email);
        expect(meResponse.body.user.name).to.equal(newUser.name);
      }
    });

    it('should handle multiple users with different flows', async () => {
      const user1 = { ...newUser, email: 'user1@example.com', name: 'User One' };
      const user2 = { ...newUser, email: 'user2@example.com', name: 'User Two' };

      // Register both users
      await request(authSetup.app).post('/register').send(user1).expect(201);
      await request(authSetup.app).post('/register').send(user2).expect(201);

      // Verify only user1
      const token1 = await authSetup.getVerificationToken(user1.email);
      await request(authSetup.app).get(`/verify-email?token=${token1}`).expect(200);

      // User1 should be able to login
      const login1Response = await request(authSetup.app)
        .post('/login')
        .send({
          email: user1.email,
          password: user1.password,
        })
        .expect(200);

      expect(login1Response.body.user.name).to.equal('User One');

      // User2 should not be able to login (unverified)
      await request(authSetup.app)
        .post('/login')
        .send({
          email: user2.email,
          password: user2.password,
        })
        .expect(401);

      // Verify user1 can access protected endpoint
      await request(authSetup.app)
        .get('/me')
        .set('Authorization', `Bearer ${login1Response.body.token}`)
        .expect(200);
    });

    it('should reject access after user is marked as unverified', async () => {
      // Complete registration and verification
      await request(authSetup.app).post('/register').send(newUser).expect(201);
      const verificationToken = await authSetup.getVerificationToken(newUser.email);
      await request(authSetup.app).get(`/verify-email?token=${verificationToken}`).expect(200);

      // Login and get token
      const loginResponse = await request(authSetup.app)
        .post('/login')
        .send({
          email: newUser.email,
          password: newUser.password,
        })
        .expect(200);

      const token = loginResponse.body.token;

      // Initially should work
      await request(authSetup.app).get('/me').set('Authorization', `Bearer ${token}`).expect(200);

      // Mark user as unverified
      await global.dbHelper.db
        .collection('user')
        .updateOne({ _id: newUser.email }, { $set: { emailVerified: false } });

      // Should now be rejected
      await request(authSetup.app).get('/me').set('Authorization', `Bearer ${token}`).expect(401);
    });
  });
});
