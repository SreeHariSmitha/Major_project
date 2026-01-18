import axios from 'axios';
import { createApp } from './src/app.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

/**
 * Manual API Testing Script
 * Tests Story 1.1 acceptance criteria
 */

dotenv.config();

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
  console.log('🚀 Starting API Tests for Story 1.1: User Registration\n');

  // Create API client
  const api = axios.create({
    baseURL: API_BASE_URL,
    validateStatus: () => true,
  });

  // AC 1: Successful Registration with Valid Data
  await test('AC 1a: Register with valid email and password', async () => {
    const response = await api.post('/api/v1/auth/register', {
      email: 'valid@example.com',
      password: 'securepass123',
      name: 'Test User',
    });

    return (
      response.status === 201 &&
      response.data.success === true &&
      response.data.data?.email === 'valid@example.com' &&
      !response.data.data?.password
    );
  });

  await test('AC 1b: Normalize email to lowercase', async () => {
    const response = await api.post('/api/v1/auth/register', {
      email: 'UPPERCASE@EXAMPLE.COM',
      password: 'securepass123',
    });

    return (
      response.status === 201 &&
      response.data.data?.email === 'uppercase@example.com'
    );
  });

  // AC 2: Email Format Validation
  await test('AC 2a: Reject invalid email format (no @)', async () => {
    const response = await api.post('/api/v1/auth/register', {
      email: 'invalidemail',
      password: 'securepass123',
    });

    return (
      response.status === 400 &&
      response.data.success === false &&
      response.data.error?.code === 'VALIDATION_ERROR'
    );
  });

  await test('AC 2b: Reject email without domain', async () => {
    const response = await api.post('/api/v1/auth/register', {
      email: 'user@',
      password: 'securepass123',
    });

    return response.status === 400 && response.data.success === false;
  });

  // AC 3: Password Length Validation
  await test('AC 3a: Reject password < 8 characters', async () => {
    const response = await api.post('/api/v1/auth/register', {
      email: 'test@example.com',
      password: 'short',
    });

    return (
      response.status === 400 &&
      response.data.success === false &&
      response.data.error?.code === 'VALIDATION_ERROR'
    );
  });

  await test('AC 3b: Accept password with exactly 8 characters', async () => {
    const response = await api.post('/api/v1/auth/register', {
      email: 'eight@example.com',
      password: '12345678',
    });

    return response.status === 201 && response.data.success === true;
  });

  // AC 4: Duplicate Email Prevention
  await test('AC 4: Reject duplicate email (409 Conflict)', async () => {
    const email = 'duplicate-test@example.com';

    // Register first user
    await api.post('/api/v1/auth/register', {
      email,
      password: 'securepass123',
    });

    // Try to register second user with same email
    const response = await api.post('/api/v1/auth/register', {
      email,
      password: 'differentpass456',
    });

    return (
      response.status === 409 &&
      response.data.success === false &&
      response.data.error?.code === 'CONFLICT' &&
      response.data.error?.message === 'Email already registered'
    );
  });

  // Additional Tests
  await test('Security: No password in response', async () => {
    const response = await api.post('/api/v1/auth/register', {
      email: 'nosecret@example.com',
      password: 'securepass123',
    });

    return (
      response.status === 201 &&
      !response.data.data?.password &&
      response.data.data?.email === 'nosecret@example.com'
    );
  });

  await test('Error Handling: Missing email', async () => {
    const response = await api.post('/api/v1/auth/register', {
      password: 'securepass123',
    });

    return response.status === 400 && response.data.success === false;
  });

  await test('Error Handling: Missing password', async () => {
    const response = await api.post('/api/v1/auth/register', {
      email: 'test@example.com',
    });

    return response.status === 400 && response.data.success === false;
  });

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('📊 TEST RESULTS');
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
  const app = require('./src/app.js').createApp();
  const server = app.listen(5000, async () => {
    console.log('✓ Server started on port 5000\n');

    try {
      // Connect to MongoDB
      console.log('🔗 Connecting to MongoDB Atlas...');
      await mongoose.connect(MONGODB_URI);
      console.log('✓ MongoDB connected\n');

      // Clear test data
      const { User } = await import('./src/models/User.js');
      await User.deleteMany({});
      console.log('🧹 Test data cleared\n');

      // Wait for server to be ready
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Run tests
      const allPassed = await runTests();

      // Cleanup
      await User.deleteMany({});
      await mongoose.disconnect();
      server.close();

      process.exit(allPassed ? 0 : 1);
    } catch (error) {
      console.error('❌ Test error:', error);
      server.close();
      process.exit(1);
    }
  });
}

main();
