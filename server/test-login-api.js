import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  validateStatus: () => true,
});

async function runTests() {
  console.log('🚀 Starting Login API Tests\n');

  const testEmail = 'testlogin123@example.com';
  const testPassword = 'securepass123';

  // Test 1: Login with valid credentials
  console.log('Test 1: AC 1 - Login with valid credentials');
  const loginResponse = await api.post('/api/v1/auth/login', {
    email: testEmail,
    password: testPassword,
  });
  console.log(`Status: ${loginResponse.status}`);
  console.log('Response:', JSON.stringify(loginResponse.data, null, 2));
  console.log('');

  // Test 2: Invalid email format
  console.log('Test 2: AC 2a - Reject invalid email format');
  const invalidEmailResponse = await api.post('/api/v1/auth/login', {
    email: 'invalidemail',
    password: testPassword,
  });
  console.log(`Status: ${invalidEmailResponse.status}`);
  console.log('Response:', JSON.stringify(invalidEmailResponse.data, null, 2));
  console.log('');

  // Test 3: Wrong password
  console.log('Test 3: AC 3 - Wrong password');
  const wrongPasswordResponse = await api.post('/api/v1/auth/login', {
    email: testEmail,
    password: 'wrongpassword123',
  });
  console.log(`Status: ${wrongPasswordResponse.status}`);
  console.log('Response:', JSON.stringify(wrongPasswordResponse.data, null, 2));
  console.log('');

  // Test 4: Non-existent user
  console.log('Test 4: AC 4 - Non-existent user');
  const nonExistentResponse = await api.post('/api/v1/auth/login', {
    email: 'nonexistent@example.com',
    password: testPassword,
  });
  console.log(`Status: ${nonExistentResponse.status}`);
  console.log('Response:', JSON.stringify(nonExistentResponse.data, null, 2));
  console.log('');
}

runTests().catch(console.error);
