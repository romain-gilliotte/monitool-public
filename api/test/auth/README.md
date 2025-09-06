# Authentication Tests

This folder contains comprehensive integration tests for the authentication system, split into focused test files for better maintainability.

## Test File Structure

### 📁 `auth-setup.js`

**Shared test utilities and setup**

- `AuthTestSetup` class for common test operations
- Helper methods for creating users, logging in, getting tokens
- Centralized test setup and teardown logic
- Reduces code duplication across test files

### 📋 `registration.test.js`

**User Registration Tests (7 tests)**

- Valid registration with proper data validation
- Input validation (missing fields, password requirements)
- Duplicate user prevention
- Email service integration verification
- Database state verification
- Multiple email format support

### 🔐 `login.test.js`

**User Login Tests (6 tests)**

- Valid login with JWT token generation
- Invalid credential handling
- Email verification requirement enforcement
- Missing credential validation
- Case-sensitive email handling
- Token validation and user data verification

### ✉️ `email-verification.test.js`

**Email Verification Tests (4 tests)**

- Valid token verification
- Invalid/missing token handling
- Database state updates after verification
- Prevention of double verification with same token

### 👤 `user-info.test.js`

**User Info & Session Management Tests (7 tests)**

- Authenticated user info retrieval (`/me` endpoint)
- Authorization header validation
- Invalid token rejection
- Malformed header handling
- Unverified user rejection
- Logout functionality

### 🔄 `auth-flows.test.js`

**Complete Authentication Flows Tests (5 tests)**

- Full user journey (registration → verification → login → access)
- Prevention of login before verification
- User state maintenance across requests
- Multiple user scenarios
- Security state changes (unverification)

## Total Test Coverage

- **29 comprehensive tests** across all authentication flows
- **100% endpoint coverage** for authentication routes
- **Multiple validation scenarios** for each functionality
- **Complete user journey testing**
- **Error condition and edge case testing**

## Test Architecture Benefits

### 🔧 **Modular Design**

- Each file focuses on specific functionality
- Easy to locate and update specific test scenarios
- Better code organization and readability

### 🔄 **Shared Setup**

- Common test utilities in `auth-setup.js`
- Reduces code duplication
- Consistent test environment setup
- Helper methods for common operations

### 🧪 **Isolated Testing**

- Each test file can run independently
- Clean database state between tests
- Proper setup and teardown for each test suite

### 📊 **Comprehensive Coverage**

- All authentication endpoints tested
- Multiple validation scenarios
- Complete user journey flows
- Error handling and edge cases

## Running the Tests

```bash
# Run all authentication tests
npm test -- --grep "User Registration|User Login|Email Verification|User Info|Complete Authentication"

# Run specific test file
npm test test/auth/registration.test.js
npm test test/auth/login.test.js
npm test test/auth/email-verification.test.js
npm test test/auth/user-info.test.js
npm test test/auth/auth-flows.test.js

# Run all tests
npm test
```

## Key Features Tested

1. **🔒 Password Security**: Proper bcrypt hashing
2. **✉️ Email Verification**: Required before login
3. **🎫 JWT Authentication**: Token generation and validation
4. **✅ Input Validation**: Comprehensive field validation
5. **🚨 Error Handling**: Proper error messages and status codes
6. **💾 Database Integrity**: User creation and state management
7. **📧 Email Service**: Verification email integration
8. **🔤 Case Sensitivity**: Email address handling
9. **🔐 Token Security**: JWT verification and expiration
10. **👤 User State**: Last seen timestamps, verification status

## Test Quality Assurance

- ✅ All tests pass consistently
- ✅ Proper cleanup between tests
- ✅ Mocked external services (email)
- ✅ Real database integration
- ✅ Comprehensive error scenario coverage
- ✅ Security best practices validation
