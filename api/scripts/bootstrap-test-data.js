#!/usr/bin/env node

/**
 * Bootstrap script for setting up test data in development database
 * This ensures e2e tests have proper user data to work with
 */

const bcrypt = require('bcrypt');
const { MongoClient } = require('mongodb');

const config = {
  // Use the same MongoDB URL as the main app
  mongoUrl: process.env.MONGO_URL || 'mongodb://localhost:27017/monitool',
};

async function createTestUser(db) {
  const collection = db.collection('user');

  const testUser = {
    _id: 'test@monitool.com',
    name: 'Test User',
    emailVerified: true, // This is key - user needs to be verified to log in
    emailVerificationToken: null, // Clear since already verified
    lastSeen: new Date(),
    picture: null,
    password: await bcrypt.hash('testpassword123', 12),
  };

  // Check if user already exists
  const existingUser = await collection.findOne({ _id: testUser._id });
  if (existingUser) {
    console.log('✓ Test user already exists:', testUser._id);

    // Update to ensure it's verified and has correct password
    await collection.updateOne(
      { _id: testUser._id },
      {
        $set: {
          emailVerified: true,
          password: testUser.password,
          lastSeen: new Date(),
        },
      }
    );
    console.log('✓ Updated test user to be verified with correct password');
  } else {
    await collection.insertOne(testUser);
    console.log('✓ Created test user:', testUser._id);
  }

  return testUser;
}

async function createAuth0User(db) {
  const collection = db.collection('user');

  const auth0User = {
    _id: 'auth0user@example.com',
    name: 'Auth0 Test User',
    emailVerified: true, // Auth0 users were already verified
    emailVerificationToken: null,
    lastSeen: new Date(),
    picture: 'https://example.com/avatar.jpg',
    subs: ['auth0|507f1f77bcf86cd799439011'], // Auth0 subscriber ID
    // No password field - this is what identifies Auth0 users
  };

  // Check if user already exists
  const existingUser = await collection.findOne({ _id: auth0User._id });
  if (existingUser) {
    console.log('✓ Auth0 test user already exists:', auth0User._id);

    // Update to ensure it has the correct structure (subs but no password)
    await collection.updateOne(
      { _id: auth0User._id },
      {
        $set: {
          emailVerified: true,
          subs: auth0User.subs,
          lastSeen: new Date(),
        },
        $unset: {
          password: '', // Remove password field if it exists
        },
      }
    );
    console.log('✓ Updated Auth0 test user to have correct structure');
  } else {
    await collection.insertOne(auth0User);
    console.log('✓ Created Auth0 test user:', auth0User._id);
  }

  return auth0User;
}

async function createDemoProject(db, userEmail) {
  const collection = db.collection('project');

  const demoProject = {
    _id: 'demo-project-' + userEmail.replace('@', '-at-'),
    name: 'Demo Project',
    shortName: 'demo',
    country: 'test-country',
    themes: ['health'],
    crossCutting: [],
    users: [userEmail],
    visibility: 'private',
    created: new Date(),
    start: new Date(),
    end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
    logicalFramework: {
      goal: 'Demo project goal',
      indicators: [],
      activities: [],
    },
  };

  const existingProject = await collection.findOne({ _id: demoProject._id });
  if (!existingProject) {
    await collection.insertOne(demoProject);
    console.log('✓ Created demo project for test user');
  } else {
    console.log('✓ Demo project already exists for test user');
  }
}

async function bootstrapTestData() {
  console.log('🚀 Bootstrapping test data for development database...');

  let client;
  try {
    // Connect to MongoDB
    client = new MongoClient(config.mongoUrl);
    await client.connect();
    console.log('✓ Connected to MongoDB');

    const db = client.db();

    // Create test user
    const testUser = await createTestUser(db);

    // Create Auth0 test user
    const auth0User = await createAuth0User(db);

    // Create demo project for test user
    await createDemoProject(db, testUser._id);

    console.log('🎉 Test data bootstrap completed successfully!');
    console.log('');
    console.log('Test user credentials:');
    console.log('  Email: test@monitool.com');
    console.log('  Password: testpassword123');
    console.log('  Status: Email verified ✓');
    console.log('');
    console.log('Auth0 test user (for migration testing):');
    console.log('  Email: auth0user@example.com');
    console.log('  Password: <none - needs reset>');
    console.log('  Status: Auth0 migrated user ⚠️');
  } catch (error) {
    console.error('❌ Error bootstrapping test data:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('✓ Database connection closed');
    }
  }
}

// Run the bootstrap if this script is executed directly
if (require.main === module) {
  bootstrapTestData().catch(console.error);
}

module.exports = { bootstrapTestData };
