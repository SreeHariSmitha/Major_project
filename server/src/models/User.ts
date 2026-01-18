import mongoose, { Schema, Document } from 'mongoose';
import bcryptjs from 'bcryptjs';

/**
 * User Interface - TypeScript type definition
 */
export interface IUser extends Document {
  email: string;
  password: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

/**
 * User Schema - MongoDB collection structure
 */
const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email format'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Don't include password by default in queries
    },
    name: {
      type: String,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Pre-save middleware: Hash password before storing
 * Only hash if password has been modified
 */
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcryptjs.genSalt(12);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

/**
 * Instance method: Compare password for login validation
 */
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  try {
    return await bcryptjs.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

/**
 * Create and export User model
 */
export const User = mongoose.model<IUser>('User', UserSchema);
