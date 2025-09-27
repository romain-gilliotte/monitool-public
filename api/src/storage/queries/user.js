const bcrypt = require('bcrypt');
const crypto = require('crypto');
const winston = require('winston');
const { insertDemoProject } = require('./project');
const { getGravatarUrl } = require('../../utils/gravatar-service');

/**
 * Create a new user with email and password
 */
async function createUser(io, userData) {
  const collection = io.database.collection('user');

  // Determine profile picture: SSO picture first, then Gravatar
  let picture = userData.picture; // From SSO providers
  if (!picture) {
    picture = getGravatarUrl(userData.email, { size: 80 });
  }

  const user = {
    _id: userData.email,
    name: userData.name,
    emailVerified: false,
    emailVerificationToken: crypto.randomUUID(),
    lastSeen: new Date(),
    picture: picture,
  };

  if (userData.password) {
    user.password = await bcrypt.hash(userData.password, 12);
  }

  if (userData.googleId) {
    user.googleId = userData.googleId;
    user.emailVerified = true; // Google accounts are pre-verified
  }

  if (userData.microsoftId) {
    user.microsoftId = userData.microsoftId;
    user.emailVerified = true; // Microsoft accounts are pre-verified
  }

  await collection.insertOne(user);

  // Create demo project for new users
  try {
    await insertDemoProject(io, user._id);
  } catch (error) {
    winston.error('Failed to create demo project for new user:', error);
    // Don't fail user creation if demo project creation fails
  }

  return user;
}

/**
 * Find user by email
 */
async function findUserByEmail(io, email) {
  const collection = io.database.collection('user');
  return await collection.findOne({ _id: email });
}

/**
 * Find user by Google ID
 */
async function findUserByGoogleId(io, googleId) {
  const collection = io.database.collection('user');
  return await collection.findOne({ googleId });
}

/**
 * Find user by Microsoft ID
 */
async function findUserByMicrosoftId(io, microsoftId) {
  const collection = io.database.collection('user');
  return await collection.findOne({ microsoftId });
}

/**
 * Verify user password
 */
async function verifyPassword(io, email, password) {
  const user = await findUserByEmail(io, email);
  if (!user) {
    return null;
  }

  // Check if this is an Auth0 migrated user (has subs but no password)
  if (!user.password && user.subs && user.subs.length > 0) {
    return { isAuth0User: true };
  }

  if (!user.password) {
    return null;
  }

  const isValid = await bcrypt.compare(password, user.password);
  return isValid ? user : null;
}

/**
 * Update user's last seen timestamp
 */
async function updateLastSeen(io, email) {
  const collection = io.database.collection('user');
  await collection.updateOne({ _id: email }, { $currentDate: { lastSeen: true } });
}

/**
 * Verify email with token
 */
async function verifyEmail(io, token) {
  const collection = io.database.collection('user');
  const result = await collection.updateOne(
    { emailVerificationToken: token },
    {
      $set: { emailVerified: true },
      $unset: { emailVerificationToken: 1 },
    }
  );
  return result.modifiedCount > 0;
}

/**
 * Set password reset token
 */
async function setPasswordResetToken(io, email) {
  const collection = io.database.collection('user');
  const token = crypto.randomUUID();
  const expires = new Date(Date.now() + 3600000); // 1 hour

  await collection.updateOne(
    { _id: email },
    {
      $set: {
        passwordResetToken: token,
        passwordResetExpires: expires,
      },
    }
  );

  return token;
}

/**
 * Reset password with token
 */
async function resetPassword(io, token, newPassword) {
  const collection = io.database.collection('user');
  const hashedPassword = await bcrypt.hash(newPassword, 12);

  const result = await collection.updateOne(
    {
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() },
    },
    {
      $set: { password: hashedPassword },
      $unset: {
        passwordResetToken: 1,
        passwordResetExpires: 1,
      },
    }
  );

  return result.modifiedCount > 0;
}

/**
 * Link OAuth account to existing user
 */
async function linkOAuthAccount(io, email, provider, providerId) {
  const collection = io.database.collection('user');
  const updateField = provider === 'google' ? 'googleId' : 'microsoftId';

  await collection.updateOne({ _id: email }, { $set: { [updateField]: providerId } });
}

/**
 * Update users without pictures to use Gravatar
 */
async function updateUsersWithGravatar(io) {
  const collection = io.database.collection('user');

  // Find users without pictures or with null pictures
  const usersWithoutPictures = await collection
    .find({
      $or: [{ picture: null }, { picture: { $exists: false } }],
    })
    .toArray();

  let updatedCount = 0;

  for (const user of usersWithoutPictures) {
    const gravatarUrl = getGravatarUrl(user._id, { size: 80 });

    if (gravatarUrl) {
      await collection.updateOne({ _id: user._id }, { $set: { picture: gravatarUrl } });
      updatedCount++;
    }
  }

  return {
    totalUsers: usersWithoutPictures.length,
    updatedCount,
  };
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserByGoogleId,
  findUserByMicrosoftId,
  verifyPassword,
  updateLastSeen,
  verifyEmail,
  setPasswordResetToken,
  resetPassword,
  linkOAuthAccount,
  updateUsersWithGravatar,
};
