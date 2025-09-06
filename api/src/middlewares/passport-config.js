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

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (email, done) => {
  try {
    const user = await findUserByEmail({ database: global.io.database }, email);
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
        const user = await verifyPassword({ database: global.io.database }, email, password);
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
          // First, check if user exists by Google ID
          let user = await findUserByGoogleId({ database: global.io.database }, profile.id);

          if (user) {
            return done(null, user);
          }

          // Check if user exists by email
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('No email found in Google profile'));
          }

          user = await findUserByEmail({ database: global.io.database }, email);
          if (user) {
            // Link Google account to existing user
            await linkOAuthAccount({ database: global.io.database }, email, 'google', profile.id);
            user.googleId = profile.id;
            return done(null, user);
          }

          // Create new user
          user = await createUser(
            { database: global.io.database },
            {
              email,
              name: profile.displayName,
              picture: profile.photos?.[0]?.value,
              googleId: profile.id,
            }
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
          // First, check if user exists by Microsoft ID
          let user = await findUserByMicrosoftId({ database: global.io.database }, profile.id);

          if (user) {
            return done(null, user);
          }

          // Check if user exists by email
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('No email found in Microsoft profile'));
          }

          user = await findUserByEmail({ database: global.io.database }, email);
          if (user) {
            // Link Microsoft account to existing user
            await linkOAuthAccount(
              { database: global.io.database },
              email,
              'microsoft',
              profile.id
            );
            user.microsoftId = profile.id;
            return done(null, user);
          }

          // Create new user
          user = await createUser(
            { database: global.io.database },
            {
              email,
              name: profile.displayName,
              picture: profile.photos?.[0]?.value,
              microsoftId: profile.id,
            }
          );

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
}

module.exports = passport;
