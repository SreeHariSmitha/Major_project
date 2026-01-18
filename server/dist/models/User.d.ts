import mongoose, { Document } from 'mongoose';
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
 * Create and export User model
 */
export declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser> & IUser & {
    _id: mongoose.Types.ObjectId;
}, any>;
//# sourceMappingURL=User.d.ts.map