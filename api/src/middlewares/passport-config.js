const passport = require('koa-passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const MicrosoftStrategy = require('passport-microsoft').Strategy;
const config = require('../config');
const {
  findUserByEmail,
  findUserByGoogleId,
  findUserByMicrosoftId,
  verifyPassword,
  createUser,
  linkOAuthAccount,
} = require('../storage/queries/user');

// Helper function for OAuth strategy logic
async function handleOAuthStrategy(io, provider, providerId, email, displayName, picture) {
  // First, check if user exists by provider ID
  let user;
  if (provider === 'google') {
    user = await findUserByGoogleId(io, providerId);
  } else if (provider === 'microsoft') {
    user = await findUserByMicrosoftId(io, providerId);
  }

  if (user) {
    return user;
  }

  // Check if user exists by email
  if (!email) {
    throw new Error(`No email found in ${provider} profile`);
  }

  user = await findUserByEmail(io, email);
  if (user) {
    // Link OAuth account to existing user
    await linkOAuthAccount(io, email, provider, providerId);
    user[`${provider}Id`] = providerId;
    return user;
  }

  // Create new user
  const userData = {
    email,
    name: displayName,
    picture,
    [`${provider}Id`]: providerId,
  };

  return await createUser(io, userData);
}

function configurePassport(io) {
  // Serialize user for session
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (email, done) => {
    try {
      const user = await findUserByEmail(io, email);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Local Strategy (Email/Password)
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
      },
      async (email, password, done) => {
        try {
          const user = await verifyPassword(io, email, password);
          if (!user) {
            return done(null, false, { message: 'Invalid email or password' });
          }
          // Check if this is an Auth0 migrated user
          if (user.isAuth0User) {
            return done(null, false, {
              message:
                'Your account was migrated from our previous authentication system. Please reset your password to continue.',
              isAuth0User: true,
            });
          }
          if (!user.emailVerified) {
            return done(null, false, { message: 'Please verify your email address' });
          }
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // Google OAuth Strategy
  if (config.oauth.google.clientId) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: config.oauth.google.clientId,
          clientSecret: config.oauth.google.clientSecret,
          callbackURL: '/api/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const user = await handleOAuthStrategy(
              io,
              'google',
              profile.id,
              profile.emails?.[0]?.value,
              profile.displayName,
              profile.photos?.[0]?.value
            );
            return done(null, user);
          } catch (error) {
            return done(error);
          }
        }
      )
    );
  }

  // Microsoft OAuth Strategy
  if (config.oauth.microsoft.clientId) {
    passport.use(
      new MicrosoftStrategy(
        {
          clientID: config.oauth.microsoft.clientId,
          clientSecret: config.oauth.microsoft.clientSecret,
          callbackURL: '/api/microsoft/callback',
          scope: ['user.read'],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const user = await handleOAuthStrategy(
              io,
              'microsoft',
              profile.id,
              profile.emails?.[0]?.value,
              profile.displayName,
              profile.photos?.[0]?.value
            );
            return done(null, user);
          } catch (error) {
            return done(error);
          }
        }
      )
    );
  }
}

module.exports = { passport, configurePassport };
