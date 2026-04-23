module.exports = {
  definitions: require('./_definitions'),
  $id: 'http://monitool.org/schemas/user.json',
  type: 'object',
  additionalProperties: false,
  required: ['_id', 'name', 'emailVerified', 'lastSeen'],
  properties: {
    _id: {
      type: 'string',
      format: 'email',
    },
    name: {
      type: 'string',
      minLength: 1,
    },
    picture: {
      type: 'string',
    },
    password: {
      type: 'string',
      minLength: 60, // bcrypt hash length
    },
    emailVerified: {
      type: 'boolean',
    },
    emailVerificationToken: {
      type: 'string',
    },
    passwordResetToken: {
      type: 'string',
    },
    passwordResetExpires: {
      type: 'string',
      format: 'date-time',
    },
    lastSeen: {
      type: 'string',
      format: 'date-time',
    },
    // OAuth providers
    googleId: {
      type: 'string',
    },
    microsoftId: {
      type: 'string',
    },
    // Legacy field for migration - can be removed after full migration
    subs: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
  },
};
