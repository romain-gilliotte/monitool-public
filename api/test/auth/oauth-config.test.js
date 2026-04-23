const request = require('supertest');

describe('OAuth Configuration', () => {
  let app;

  before(async () => {
    // Use the global test server
    app = await testServer.start();
  });

  after(async () => {
    await testServer.stop();
  });

  describe('OAuth Routes', () => {
    it('should handle Google OAuth route gracefully when not configured', async () => {
      // When OAuth is not configured, the route should still exist but handle gracefully
      const response = await request(app).get('/google').expect(500); // Should return error instead of crashing

      expect(response.body).to.have.property('error');
    });

    it('should handle Microsoft OAuth route gracefully when not configured', async () => {
      // When OAuth is not configured, the route should still exist but handle gracefully
      const response = await request(app).get('/microsoft').expect(500); // Should return error instead of crashing

      expect(response.body).to.have.property('error');
    });

    it('should handle Google OAuth callback gracefully when not configured', async () => {
      const response = await request(app).get('/google/callback').expect(500);

      expect(response.body).to.have.property('error');
    });

    it('should handle Microsoft OAuth callback gracefully when not configured', async () => {
      const response = await request(app).get('/microsoft/callback').expect(500);

      expect(response.body).to.have.property('error');
    });

    it('should return proper error message for unconfigured OAuth', async () => {
      const response = await request(app).get('/google').expect(500);

      expect(response.body.error).to.include('OAuth provider not configured');
    });
  });

  describe('OAuth Configuration Check', () => {
    it('should not provide oauth-config endpoint (removed)', async () => {
      // The oauth-config endpoint was removed as part of cleanup
      const response = await request(app).get('/oauth-config').expect(404);

      expect(response.body).to.have.property('error');
    });
  });
});
