import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { User } from '../../models/User';

/**
 * User Model Tests
 * Validates User schema, validation, and password hashing
 */
describe('User Model', () => {
  beforeAll(async () => {
    // Connect to test database
    const testDbUri = 'mongodb://localhost:27017/startup-validator-test';
    try {
      await mongoose.connect(testDbUri);
    } catch (error) {
      console.log('Using existing MongoDB connection');
    }
  });

  afterAll(async () => {
    // Cleanup: Delete test collection
    try {
      await User.deleteMany({});
      await mongoose.disconnect();
    } catch (error) {
      console.log('Cleanup completed');
    }
  });

  describe('Schema Validation', () => {
    it('should create a user with valid data', async () => {
      const user = new User({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      expect(user.email).toBe('test@example.com');
      expect(user.name).toBe('Test User');
      expect(user.password).toBe('password123'); // Not yet hashed (pre-save not called)
    });

    it('should require email', () => {
      const user = new User({
        password: 'password123',
      });

      const error = user.validateSync();
      expect(error).toBeDefined();
      expect(error?.errors['email']).toBeDefined();
    });

    it('should require password', () => {
      const user = new User({
        email: 'test@example.com',
      });

      const error = user.validateSync();
      expect(error).toBeDefined();
      expect(error?.errors['password']).toBeDefined();
    });

    it('should reject invalid email format', () => {
      const user = new User({
        email: 'invalid-email',
        password: 'password123',
      });

      const error = user.validateSync();
      expect(error).toBeDefined();
      expect(error?.errors['email']).toBeDefined();
    });

    it('should reject short password', () => {
      const user = new User({
        email: 'test@example.com',
        password: 'short', // Less than 8 chars
      });

      const error = user.validateSync();
      expect(error).toBeDefined();
      expect(error?.errors['password']).toBeDefined();
    });

    it('should allow name to be optional', () => {
      const user = new User({
        email: 'test@example.com',
        password: 'password123',
      });

      const error = user.validateSync();
      expect(error).toBeUndefined();
    });

    it('should reject name exceeding max length', () => {
      const longName = 'a'.repeat(101); // 101 chars (max is 100)
      const user = new User({
        email: 'test@example.com',
        password: 'password123',
        name: longName,
      });

      const error = user.validateSync();
      expect(error).toBeDefined();
      expect(error?.errors['name']).toBeDefined();
    });
  });

  describe('Password Hashing', () => {
    it('should hash password before saving', async () => {
      const plainPassword = 'password123';
      const user = new User({
        email: 'hash-test@example.com',
        password: plainPassword,
      });

      await user.save();

      // Retrieve from database
      const savedUser = await User.findById(user._id).select('+password');
      expect(savedUser?.password).not.toBe(plainPassword);
      expect(savedUser?.password).toBeTruthy();
      expect(savedUser?.password?.length).toBeGreaterThan(plainPassword.length);
    });

    it('should not re-hash password on update if not modified', async () => {
      const user = await User.create({
        email: 'no-rehash@example.com',
        password: 'password123',
        name: 'Original Name',
      });

      const originalPasswordHash = (await User.findById(user._id).select('+password'))
        ?.password;

      // Update name only (not password)
      user.name = 'Updated Name';
      await user.save();

      const updatedUser = await User.findById(user._id).select('+password');
      expect(updatedUser?.password).toBe(originalPasswordHash);
    });
  });

  describe('Instance Methods', () => {
    it('should compare passwords correctly', async () => {
      const plainPassword = 'testpassword123';
      const user = await User.create({
        email: 'compare-test@example.com',
        password: plainPassword,
      });

      const isMatch = await user.comparePassword(plainPassword);
      expect(isMatch).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const user = await User.create({
        email: 'wrong-pass@example.com',
        password: 'correctpassword123',
      });

      const isMatch = await user.comparePassword('wrongpassword123');
      expect(isMatch).toBe(false);
    });
  });

  describe('Email Uniqueness', () => {
    it('should enforce unique email constraint', async () => {
      const email = 'unique-test@example.com';
      await User.create({
        email,
        password: 'password123',
      });

      // Attempt to create another user with same email
      try {
        await User.create({
          email,
          password: 'different-password',
        });
        expect.fail('Should have thrown duplicate email error');
      } catch (error: any) {
        expect(error.code).toBe(11000); // MongoDB duplicate key error
      }
    });
  });

  describe('Email Normalization', () => {
    it('should lowercase and trim email', async () => {
      const user = await User.create({
        email: '  TEST@EXAMPLE.COM  ',
        password: 'password123',
      });

      expect(user.email).toBe('test@example.com');
    });
  });
});
