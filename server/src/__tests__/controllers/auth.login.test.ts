import axios from 'axios';
import { User } from '../../models/User.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Login Endpoint Integration Tests
 * Tests Story 1.2: User Login with Email and Password
 */

const API_BASE_URL = 'http://localhost:5000';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/startup-validator';

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
}

const results: TestResult[] = [];

async function test(name: string, fn: () => Promise<boolean>) {
  try {
    const passed = await fn();
    results.push({
      name,
      passed,
      message: passed ? '✓ PASS' : '✗ FAIL',
    });
  } catch (error: any) {
    results.push({
      name,
      passed: false,
      message: `✗ ERROR: ${error.message}`,
    });
  }
}

async function runTests() {
  console.log('🚀 Starting Login Tests for Story 1.2: User Login\n');

  // Create API client
  const api = axios.create({
    baseURL: API_BASE_URL,
    validateStatus: () => true,
  });

  // Test data
  const testEmail = 'logintest@example.com';
  const testPassword = 'securepass123';
  const testName = 'Login Test User';

  // Pre-test: Clear test data and register a test user
  console.log('⚙️  Setting up test user...\n');
  try {
    await User.deleteMany({ email: testEmail });
    const newUser = new User({
      email: testEmail,
      password: testPassword,
      name: testName,
    });
    await newUser.save();
    console.log('✓ Test user registered\n');
  } catch (error) {
    console.error('❌ Failed to register test user:', error);
    process.exit(1);
  }

  // AC 1: Successful Login with Valid Credentials
  await test('AC 1: Login with valid email and password', async () => {
    const response = await api.post('/api/v1/auth/login', {
      email: testEmail,
      password: testPassword,
    });

    // Verify response status
    if (response.status !== 200) {
      console.log(`Expected 200, got ${response.status}`);
      return false;
    }

    // Verify success flag
    if (!response.data.success) {
      return false;
    }

    // Verify user data in response
    if (
      !response.data.data ||
      response.data.data.email !== testEmail ||
      response.data.data.name !== testName
    ) {
      console.log('Missing or incorrect user data');
      return false;
    }

    // Verify tokens are present
    if (!response.data.data.accessToken || !response.data.data.refreshToken) {
      console.log('Missing accessToken or refreshToken');
      return false;
    }

    // Verify tokens are not empty strings
    if (
      response.data.data.accessToken.length === 0 ||
      response.data.data.refreshToken.length === 0
    ) {
      console.log('Tokens are empty');
      return false;
    }

    // Verify password is NOT in response
    if (response.data.data.password) {
      console.log('Password should not be in response');
      return false;
    }

    return true;
  });

  // AC 2: Email and Password Validation
  await test('AC 2a: Reject invalid email format (no @)', async () => {
    const response = await api.post('/api/v1/auth/login', {
      email: 'invalidemail',
      password: testPassword,
    });

    return (
      response.status === 400 &&
      response.data.success === false &&
      response.data.error?.code === 'VALIDATION_ERROR'
    );
  });

  await test('AC 2b: Reject missing password', async () => {
    const response = await api.post('/api/v1/auth/login', {
      email: testEmail,
    });

    return (
      response.status === 400 &&
      response.data.success === false &&
      response.data.error?.code === 'VALIDATION_ERROR'
    );
  });

  // AC 3: Invalid Credentials Error Handling
  await test('AC 3: Reject wrong password with generic error', async () => {
    const response = await api.post('/api/v1/auth/login', {
      email: testEmail,
      password: 'wrongpassword123',
    });

    return (
      response.status === 401 &&
      response.data.success === false &&
      response.data.error?.code === 'UNAUTHORIZED' &&
      response.data.error?.message === 'Invalid email or password'
    );
  });

  // AC 4: User Account Not Found
  await test('AC 4: Reject non-existent user with generic error', async () => {
    const response = await api.post('/api/v1/auth/login', {
      email: 'nonexistent@example.com',
      password: testPassword,
    });

    return (
      response.status === 401 &&
      response.data.success === false &&
      response.data.error?.code === 'UNAUTHORIZED' &&
      response.data.error?.message === 'Invalid email or password'
    );
  });

  // Additional Test: Email case-insensitivity
  await test('Additional: Email normalization (case-insensitive login)', async () => {
    const response = await api.post('/api/v1/auth/login', {
      email: testEmail.toUpperCase(),
      password: testPassword,
    });

    return response.status === 200 && response.data.success === true;
  });

  // Additional Test: Token format verification
  await test('Additional: JWT token format verification', async () => {
    const response = await api.post('/api/v1/auth/login', {
      email: testEmail,
      password: testPassword,
    });

    if (response.status !== 200) return false;

    const accessToken = response.data.data.accessToken;
    const refreshToken = response.data.data.refreshToken;

    // JWT tokens should have 3 parts separated by dots
    if (!accessToken.includes('.') || !refreshToken.includes('.')) {
      console.log('Tokens do not have valid JWT format');
      return false;
    }

    // Count parts (should be 3)
    if (accessToken.split('.').length !== 3 || refreshToken.split('.').length !== 3) {
      console.log('JWT tokens should have 3 parts');
      return false;
    }

    return true;
  });

  // Print results
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('📊 LOGIN TEST RESULTS');
  console.log('═══════════════════════════════════════════════════════════\n');

  let passed = 0;
  let failed = 0;

  results.forEach((result) => {
    console.log(`${result.message} | ${result.name}`);
    if (result.passed) passed++;
    else failed++;
  });

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(`✅ Passed: ${passed}/${results.length}`);
  console.log(`❌ Failed: ${failed}/${results.length}`);
  console.log('═══════════════════════════════════════════════════════════\n');

  return failed === 0;
}

async function main() {
  try {
    // Connect to MongoDB
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✓ MongoDB connected\n');

    // Run tests
    const allPassed = await runTests();

    // Cleanup
    console.log('🧹 Cleaning up test data...');
    await User.deleteMany({ email: 'logintest@example.com' });
    console.log('✓ Test data cleared\n');

    // Disconnect
    await mongoose.disconnect();
    console.log('✓ MongoDB disconnected\n');

    process.exit(allPassed ? 0 : 1);
  } catch (error) {
    console.error('❌ Test error:', error);
    process.exit(1);
  }
}

main();
