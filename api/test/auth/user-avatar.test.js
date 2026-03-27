const { expect } = require('chai');
const { createUser } = require('../../src/storage/queries/user');
const { getGravatarUrl } = require('../../src/utils/gravatar-service');

describe('User Avatar Assignment', () => {
  let io;

  before(async () => {
    await global.dbHelper.connect();
    io = { database: global.dbHelper.db };
  });

  beforeEach(async () => {
    await global.dbHelper.cleanup();
  });

  after(async () => {
    await global.dbHelper.disconnect();
  });

  describe('createUser', () => {
    it('should use SSO profile picture when provided', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'testpassword123',
        picture: 'https://lh3.googleusercontent.com/test-profile-picture',
      };

      const user = await createUser(io, userData);

      expect(user.picture).to.equal('https://lh3.googleusercontent.com/test-profile-picture');
    });

    it('should fall back to Gravatar when no SSO picture is provided', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'testpassword123',
        // No picture provided
      };

      const expectedGravatarUrl = getGravatarUrl('test@example.com', { size: 80 });
      const user = await createUser(io, userData);

      expect(user.picture).to.equal(expectedGravatarUrl);
      expect(user.picture).to.include('gravatar.com');
    });

    it('should fall back to Gravatar when SSO picture is null', async () => {
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'testpassword123',
        picture: null,
      };

      const expectedGravatarUrl = getGravatarUrl('test@example.com', { size: 80 });
      const user = await createUser(io, userData);

      expect(user.picture).to.equal(expectedGravatarUrl);
      expect(user.picture).to.include('gravatar.com');
    });

    it('should work for Google OAuth users with profile picture', async () => {
      const userData = {
        email: 'google@example.com',
        name: 'Google User',
        picture: 'https://lh3.googleusercontent.com/google-profile',
        googleId: 'google123',
      };

      const user = await createUser(io, userData);

      expect(user.picture).to.equal('https://lh3.googleusercontent.com/google-profile');
      expect(user.googleId).to.equal('google123');
      expect(user.emailVerified).to.be.true;
    });

    it('should work for Microsoft OAuth users with profile picture', async () => {
      const userData = {
        email: 'microsoft@example.com',
        name: 'Microsoft User',
        picture: 'https://graph.microsoft.com/profile-picture',
        microsoftId: 'microsoft123',
      };

      const user = await createUser(io, userData);

      expect(user.picture).to.equal('https://graph.microsoft.com/profile-picture');
      expect(user.microsoftId).to.equal('microsoft123');
      expect(user.emailVerified).to.be.true;
    });
  });
});
