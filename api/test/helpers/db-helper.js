const { MongoClient } = require('mongodb');
const config = require('../../src/config');

class DatabaseHelper {
  constructor() {
    this.client = null;
    this.db = null;
  }

  async connect() {
    if (this.client) {
      return this.db;
    }

    this.client = await MongoClient.connect(config.mongo.uri, {
      useUnifiedTopology: true,
    });
    this.db = this.client.db(config.mongo.database);
    return this.db;
  }

  async cleanup() {
    if (!this.db) {
      await this.connect();
    }

    // Clear all test collections
    const collections = ['user', 'project', 'invitation', 'input', 'input_upload'];

    for (const collectionName of collections) {
      try {
        await this.db.collection(collectionName).deleteMany({});
      } catch (error) {
        // Collection might not exist yet, ignore error
      }
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
    }
  }

  async createTestUser(userData = {}) {
    if (!this.db) {
      await this.connect();
    }

    const bcrypt = require('bcrypt');
    const crypto = require('crypto');

    const defaultUser = {
      _id: userData.email || 'test@example.com',
      name: userData.name || 'Test User',
      password: await bcrypt.hash(userData.password || 'password123', 10),
      emailVerified: userData.emailVerified !== undefined ? userData.emailVerified : true,
      emailVerificationToken: userData.emailVerified === false ? crypto.randomUUID() : null,
      passwordResetToken: null,
      passwordResetExpires: null,
      createdAt: new Date(),
      lastSeenAt: new Date(),
    };

    const user = { ...defaultUser, ...userData };
    await this.db.collection('user').insertOne(user);
    return user;
  }
}

module.exports = DatabaseHelper;
