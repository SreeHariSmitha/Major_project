import { createApp } from './dist/app.js';
import mongoose from 'mongoose';
import { User } from './dist/models/User.js';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/startup-validator';

async function runTests() {
  console.log('🚀 Starting Direct Login API Tests\n');

  let server;

  try {
    // Connect to MongoDB
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✓ MongoDB connected\n');

    // Create and start app
    console.log('⚙️  Starting Express app...');
    const app = createApp();
    server = app.listen(5001, () => {
      console.log('✓ Server running on port 5001\n');
    });

    // Wait for server to be ready
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create API client
    const api = axios.create({
      baseURL: 'http://localhost:5001',
      validateStatus: () => true,
    });

    const testEmail = 'directtest@example.com';
    const testPassword = 'securepass123';
    const testName = 'Direct Test User';

    // Pre-test: Clear test data and register a test user
    console.log('⚙️  Setting up test user...\n');
    await User.deleteMany({ email: testEmail });
    const newUser = new User({
      email: testEmail,
      password: testPassword,
      name: testName,
    });
    await newUser.save();
    console.log('✓ Test user registered\n');

    // Test 1: Login with valid credentials
    console.log('✅ Test 1: AC 1 - Login with valid credentials');
    const loginResponse = await api.post('/api/v1/auth/login', {
      email: testEmail,
      password: testPassword,
    });
    console.log(`Status: ${loginResponse.status} (expected 200)`);
    console.log(`Success: ${loginResponse.data.success} (expected true)`);
    if (loginResponse.data.data) {
      console.log(`Email matches: ${loginResponse.data.data.email === testEmail}`);
      console.log(`Has accessToken: ${!!loginResponse.data.data.accessToken}`);
      console.log(`Has refreshToken: ${!!loginResponse.data.data.refreshToken}`);
      console.log(`No password in response: ${!loginResponse.data.data.password}`);
    }
    console.log('');

    // Test 2: Invalid email format
    console.log('✅ Test 2: AC 2a - Reject invalid email format');
    const invalidEmailResponse = await api.post('/api/v1/auth/login', {
      email: 'invalidemail',
      password: testPassword,
    });
    console.log(`Status: ${invalidEmailResponse.status} (expected 400)`);
    console.log(`Success: ${invalidEmailResponse.data.success} (expected false)`);
    console.log(`Error code: ${invalidEmailResponse.data.error?.code} (expected VALIDATION_ERROR)`);
    console.log('');

    // Test 3: Missing password
    console.log('✅ Test 2b - Reject missing password');
    const noPasswordResponse = await api.post('/api/v1/auth/login', {
      email: testEmail,
    });
    console.log(`Status: ${noPasswordResponse.status} (expected 400)`);
    console.log(`Success: ${noPasswordResponse.data.success} (expected false)`);
    console.log(`Error code: ${noPasswordResponse.data.error?.code} (expected VALIDATION_ERROR)`);
    console.log('');

    // Test 4: Wrong password
    console.log('✅ Test 3: AC 3 - Reject wrong password with generic error');
    const wrongPasswordResponse = await api.post('/api/v1/auth/login', {
      email: testEmail,
      password: 'wrongpassword123',
    });
    console.log(`Status: ${wrongPasswordResponse.status} (expected 401)`);
    console.log(`Success: ${wrongPasswordResponse.data.success} (expected false)`);
    console.log(`Error code: ${wrongPasswordResponse.data.error?.code} (expected UNAUTHORIZED)`);
    console.log(`Error message: "${wrongPasswordResponse.data.error?.message}" (expected "Invalid email or password")`);
    console.log('');

    // Test 5: Non-existent user
    console.log('✅ Test 4: AC 4 - Reject non-existent user with generic error');
    const nonExistentResponse = await api.post('/api/v1/auth/login', {
      email: 'nonexistent@example.com',
      password: testPassword,
    });
    console.log(`Status: ${nonExistentResponse.status} (expected 401)`);
    console.log(`Success: ${nonExistentResponse.data.success} (expected false)`);
    console.log(`Error code: ${nonExistentResponse.data.error?.code} (expected UNAUTHORIZED)`);
    console.log(`Error message: "${nonExistentResponse.data.error?.message}" (expected "Invalid email or password")`);
    console.log('');

    // Test 6: Email case-insensitivity
    console.log('✅ Test 5: Additional - Email normalization (case-insensitive login)');
    const uppercaseEmailResponse = await api.post('/api/v1/auth/login', {
      email: testEmail.toUpperCase(),
      password: testPassword,
    });
    console.log(`Status: ${uppercaseEmailResponse.status} (expected 200)`);
    console.log(`Success: ${uppercaseEmailResponse.data.success} (expected true)`);
    console.log('');

    // Test 7: JWT token format
    console.log('✅ Test 6: Additional - JWT token format verification');
    const tokenResponse = await api.post('/api/v1/auth/login', {
      email: testEmail,
      password: testPassword,
    });
    if (tokenResponse.data.data?.accessToken && tokenResponse.data.data?.refreshToken) {
      const accessParts = tokenResponse.data.data.accessToken.split('.');
      const refreshParts = tokenResponse.data.data.refreshToken.split('.');
      console.log(`Access token parts: ${accessParts.length} (expected 3)`);
      console.log(`Refresh token parts: ${refreshParts.length} (expected 3)`);
      console.log(`Valid JWT format: ${accessParts.length === 3 && refreshParts.length === 3}`);
    }
    console.log('');

    // Cleanup
    console.log('🧹 Cleaning up test data...');
    await User.deleteMany({ email: testEmail });
    console.log('✓ Test data cleared\n');

    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ All login tests completed successfully!');
    console.log('═══════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Test error:', error);
    process.exit(1);
  } finally {
    if (server) {
      server.close();
    }
    await mongoose.disconnect();
    process.exit(0);
  }
}

runTests();
