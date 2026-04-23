const { expect } = require('chai');
const sinon = require('sinon');
const TestServer = require('./helpers/test-server');
const DatabaseHelper = require('./helpers/db-helper');

// Make chai and sinon globally available
global.expect = expect;
global.sinon = sinon;

// Test utilities
global.testServer = new TestServer();
global.dbHelper = new DatabaseHelper();

// Mock email service to prevent actual emails during tests
const emailService = require('../src/utils/email-service');
global.emailServiceStub = sinon.stub(emailService, 'sendVerificationEmail').resolves();
global.passwordResetStub = sinon.stub(emailService, 'sendPasswordResetEmail').resolves();
