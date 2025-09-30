const request = require('supertest');
const AuthTestSetup = require('./auth-setup');

describe('User Registration', () => {
  const authSetup = new AuthTestSetup();

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

  describe('POST /register', () => {
    const validUserData = {
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
    };

    it('should successfully register a new user with valid data', async () => {
      const response = await request(authSetup.app)
        .post('/register')
        .send(validUserData)
        .expect(201);

      expect(response.body).to.have.property('message');
      expect(response.body.message).to.contain('Registration successful');
      expect(response.body).to.have.property('emailSent', true);

      // Verify email service was called
      expect(global.emailServiceStub.calledOnce).to.be.true;
      expect(global.emailServiceStub.firstCall.args[0]).to.equal(validUserData.email);
      expect(global.emailServiceStub.firstCall.args[1]).to.equal(validUserData.name);

      // Verify user was created in database
      const user = await global.dbHelper.db
        .collection('user')
        .findOne({ _id: validUserData.email });
      expect(user).to.exist;
      expect(user.name).to.equal(validUserData.name);
      expect(user.emailVerified).to.be.false;
      expect(user.emailVerificationToken).to.exist;
      expect(user.password).to.exist;
      expect(user.password).to.not.equal(validUserData.password); // Should be hashed
    });

    it('should reject registration with missing email', async () => {
      const invalidData = { ...validUserData };
      delete invalidData.email;

      const response = await request(authSetup.app).post('/register').send(invalidData).expect(400);

      expect(response.body).to.have.property('error');
      expect(response.body.error).to.contain('Email, password, and name are required');

      // Verify no email was sent
      expect(global.emailServiceStub.called).to.be.false;
    });

    it('should reject registration with missing password', async () => {
      const invalidData = { ...validUserData };
      delete invalidData.password;

      const response = await request(authSetup.app).post('/register').send(invalidData).expect(400);

      expect(response.body).to.have.property('error');
      expect(response.body.error).to.contain('Email, password, and name are required');
    });

    it('should reject registration with missing name', async () => {
      const invalidData = { ...validUserData };
      delete invalidData.name;

      const response = await request(authSetup.app).post('/register').send(invalidData).expect(400);

      expect(response.body).to.have.property('error');
      expect(response.body.error).to.contain('Email, password, and name are required');
    });

    it('should reject registration with password shorter than 8 characters', async () => {
      const invalidData = { ...validUserData, password: '1234567' };

      const response = await request(authSetup.app).post('/register').send(invalidData).expect(400);

      expect(response.body).to.have.property('error');
      expect(response.body.error).to.contain('Password must be at least 8 characters long');
    });

    it('should reject registration if user already exists', async () => {
      // First registration
      await request(authSetup.app).post('/register').send(validUserData).expect(201);

      // Attempt to register the same user again
      const response = await request(authSetup.app)
        .post('/register')
        .send(validUserData)
        .expect(400);

      expect(response.body).to.have.property('error');
      expect(response.body.error).to.contain('User already exists with this email');

      // Verify email service was called only once (for the first registration)
      expect(global.emailServiceStub.calledOnce).to.be.true;
    });

    it('should handle different email formats correctly', async () => {
      const testEmails = ['user@domain.com', 'user.name@domain.co.uk', 'user+tag@domain.org'];

      for (const email of testEmails) {
        await global.dbHelper.cleanup(); // Clean between each test

        const userData = { ...validUserData, email };
        const response = await request(authSetup.app).post('/register').send(userData).expect(201);

        expect(response.body.message).to.contain('Registration successful');
      }
    });
  });
});
