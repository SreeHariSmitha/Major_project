import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import express from 'express';
import { createApp } from '../../app';
import { User } from '../../models/User';
import axios, { AxiosInstance } from 'axios';

/**
 * Auth Controller Tests
 * Validates all acceptance criteria for Story 1.1: User Registration
 */
describe('POST /api/v1/auth/register', () => {
  let app: express.Express;
  let server: any;
  let apiClient: AxiosInstance;
  const TEST_PORT = 5001;
  const API_BASE_URL = `http://localhost:${TEST_PORT}`;

  beforeAll(async () => {
    // Connect to test database
    const testDbUri = 'mongodb://localhost:27017/startup-validator-test';
    try {
      if (mongoose.connection.readyState === 0) {
        await mongoose.connect(testDbUri);
      }
    } catch (error) {
      console.log('MongoDB connection already established');
    }

    // Create and start test server
    app = createApp();
    server = app.listen(TEST_PORT, () => {
      console.log(`Test server running on port ${TEST_PORT}`);
    });

    // Create API client
    apiClient = axios.create({
      baseURL: API_BASE_URL,
      validateStatus: () => true, // Don't throw on any status
    });

    // Wait for server to start
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });

  afterAll(async () => {
    // Cleanup
    await User.deleteMany({});
    server.close();
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    // Clear users before each test
    await User.deleteMany({});
  });

  describe('AC 1: Successful Registration with Valid Data', () => {
    it('should create user and return 201 with user data', async () => {
      const response = await apiClient.post('/api/v1/auth/register', {
        email: 'newuser@example.com',
        password: 'securepass123',
        name: 'New User',
      });

      // Check status code
      expect(response.status).toBe(201);

      // Check response format
      expect(response.data).toHaveProperty('success', true);
      expect(response.data).toHaveProperty('data');
      expect(response.data).not.toHaveProperty('error');

      // Check user data in response
      const userData = response.data.data;
      expect(userData).toHaveProperty('_id');
      expect(userData).toHaveProperty('email', 'newuser@example.com');
      expect(userData).toHaveProperty('name', 'New User');
      expect(userData).not.toHaveProperty('password');

      // Verify user in database
      const dbUser = await User.findOne({ email: 'newuser@example.com' });
      expect(dbUser).toBeDefined();
      expect(dbUser?.name).toBe('New User');
    });

    it('should normalize email to lowercase', async () => {
      const response = await apiClient.post('/api/v1/auth/register', {
        email: 'TEST@EXAMPLE.COM',
        password: 'securepass123',
      });

      expect(response.status).toBe(201);
      expect(response.data.data.email).toBe('test@example.com');

      const dbUser = await User.findOne({ email: 'test@example.com' });
      expect(dbUser).toBeDefined();
    });

    it('should work without optional name field', async () => {
      const response = await apiClient.post('/api/v1/auth/register', {
        email: 'noname@example.com',
        password: 'securepass123',
      });

      expect(response.status).toBe(201);
      expect(response.data.data.email).toBe('noname@example.com');
    });
  });

  describe('AC 2: Email Format Validation', () => {
    it('should reject invalid email format', async () => {
      const response = await apiClient.post('/api/v1/auth/register', {
        email: 'invalid-email',
        password: 'securepass123',
      });

      // Check status code
      expect(response.status).toBe(400);

      // Check response format
      expect(response.data).toHaveProperty('success', false);
      expect(response.data).toHaveProperty('error');
      expect(response.data.error).toHaveProperty('code', 'VALIDATION_ERROR');
      expect(response.data.error.message).toContain('Validation failed');

      // No user should be created
      const dbUser = await User.findOne({ email: 'invalid-email' });
      expect(dbUser).toBeNull();
    });

    it('should reject email without @ symbol', async () => {
      const response = await apiClient.post('/api/v1/auth/register', {
        email: 'invalidemail.com',
        password: 'securepass123',
      });

      expect(response.status).toBe(400);
      expect(response.data.success).toBe(false);
    });

    it('should reject email without domain', async () => {
      const response = await apiClient.post('/api/v1/auth/register', {
        email: 'user@',
        password: 'securepass123',
      });

      expect(response.status).toBe(400);
      expect(response.data.success).toBe(false);
    });
  });

  describe('AC 3: Password Length Validation', () => {
    it('should reject password shorter than 8 characters', async () => {
      const response = await apiClient.post('/api/v1/auth/register', {
        email: 'test@example.com',
        password: 'short', // Only 5 chars
      });

      // Check status code
      expect(response.status).toBe(400);

      // Check response format
      expect(response.data).toHaveProperty('success', false);
      expect(response.data).toHaveProperty('error');
      expect(response.data.error).toHaveProperty('code', 'VALIDATION_ERROR');

      // No user should be created
      const dbUser = await User.findOne({ email: 'test@example.com' });
      expect(dbUser).toBeNull();
    });

    it('should accept password with exactly 8 characters', async () => {
      const response = await apiClient.post('/api/v1/auth/register', {
        email: 'test@example.com',
        password: '12345678', // Exactly 8 chars
      });

      expect(response.status).toBe(201);
      const dbUser = await User.findOne({ email: 'test@example.com' });
      expect(dbUser).toBeDefined();
    });

    it('should accept password longer than 8 characters', async () => {
      const response = await apiClient.post('/api/v1/auth/register', {
        email: 'test@example.com',
        password: 'this-is-a-long-secure-password',
      });

      expect(response.status).toBe(201);
    });
  });

  describe('AC 4: Duplicate Email Prevention', () => {
    it('should reject duplicate email', async () => {
      const email = 'duplicate@example.com';
      const password = 'securepass123';

      // Register first user
      const firstResponse = await apiClient.post('/api/v1/auth/register', {
        email,
        password,
      });
      expect(firstResponse.status).toBe(201);

      // Attempt to register second user with same email
      const secondResponse = await apiClient.post('/api/v1/auth/register', {
        email,
        password: 'differentpass456',
      });

      // Check status code
      expect(secondResponse.status).toBe(409);

      // Check response format
      expect(secondResponse.data).toHaveProperty('success', false);
      expect(secondResponse.data).toHaveProperty('error');
      expect(secondResponse.data.error).toHaveProperty('code', 'CONFLICT');
      expect(secondResponse.data.error.message).toContain('Email already registered');

      // Only one user should exist
      const users = await User.find({ email });
      expect(users).toHaveLength(1);
    });

    it('should handle case-insensitive duplicate emails', async () => {
      const password = 'securepass123';

      // Register with lowercase email
      const firstResponse = await apiClient.post('/api/v1/auth/register', {
        email: 'user@example.com',
        password,
      });
      expect(firstResponse.status).toBe(201);

      // Attempt to register with uppercase email
      const secondResponse = await apiClient.post('/api/v1/auth/register', {
        email: 'USER@EXAMPLE.COM',
        password,
      });

      expect(secondResponse.status).toBe(409);
      expect(secondResponse.data.error.code).toBe('CONFLICT');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle missing email', async () => {
      const response = await apiClient.post('/api/v1/auth/register', {
        password: 'securepass123',
      });

      expect(response.status).toBe(400);
      expect(response.data.success).toBe(false);
    });

    it('should handle missing password', async () => {
      const response = await apiClient.post('/api/v1/auth/register', {
        email: 'test@example.com',
      });

      expect(response.status).toBe(400);
      expect(response.data.success).toBe(false);
    });

    it('should not return password in success response', async () => {
      const response = await apiClient.post('/api/v1/auth/register', {
        email: 'test@example.com',
        password: 'securepass123',
      });

      expect(response.status).toBe(201);
      expect(response.data.data).not.toHaveProperty('password');
    });

    it('should store hashed password', async () => {
      const plainPassword = 'securepass123';
      await apiClient.post('/api/v1/auth/register', {
        email: 'hash-test@example.com',
        password: plainPassword,
      });

      const dbUser = await User.findOne({ email: 'hash-test@example.com' }).select(
        '+password'
      );
      expect(dbUser?.password).not.toBe(plainPassword);
      expect(dbUser?.password).toBeTruthy();
    });

    it('should trim email whitespace', async () => {
      const response = await apiClient.post('/api/v1/auth/register', {
        email: '  test@example.com  ',
        password: 'securepass123',
      });

      expect(response.status).toBe(201);
      expect(response.data.data.email).toBe('test@example.com');
    });
  });
});
