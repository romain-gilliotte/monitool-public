const { expect } = require('chai');
const { getGravatarUrl } = require('../../src/utils/gravatar-service');

describe('Gravatar Service', () => {
  describe('getGravatarUrl', () => {
    it('should generate correct Gravatar URL for valid email', () => {
      const email = 'test@example.com';
      const expectedHash = '55502f40dc8b7c769880b10874abc9d0'; // MD5 of 'test@example.com'
      const url = getGravatarUrl(email);

      expect(url).to.equal(`https://www.gravatar.com/avatar/${expectedHash}?s=80&d=mp&r=pg`);
    });

    it('should handle email with uppercase letters', () => {
      const email = 'Test@Example.Com';
      const expectedHash = '55502f40dc8b7c769880b10874abc9d0'; // MD5 of 'test@example.com' (normalized)
      const url = getGravatarUrl(email);

      expect(url).to.equal(`https://www.gravatar.com/avatar/${expectedHash}?s=80&d=mp&r=pg`);
    });

    it('should handle email with leading/trailing spaces', () => {
      const email = '  test@example.com  ';
      const expectedHash = '55502f40dc8b7c769880b10874abc9d0'; // MD5 of 'test@example.com' (trimmed)
      const url = getGravatarUrl(email);

      expect(url).to.equal(`https://www.gravatar.com/avatar/${expectedHash}?s=80&d=mp&r=pg`);
    });

    it('should respect custom options', () => {
      const email = 'test@example.com';
      const expectedHash = '55502f40dc8b7c769880b10874abc9d0';
      const options = {
        size: 200,
        default: 'identicon',
        rating: 'g',
      };
      const url = getGravatarUrl(email, options);

      expect(url).to.equal(`https://www.gravatar.com/avatar/${expectedHash}?s=200&d=identicon&r=g`);
    });

    it('should return null for invalid email', () => {
      expect(getGravatarUrl(null)).to.be.null;
      expect(getGravatarUrl(undefined)).to.be.null;
      expect(getGravatarUrl('')).to.be.null;
      expect(getGravatarUrl(123)).to.be.null;
    });
  });
});
