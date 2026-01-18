import mongoose, { Document } from 'mongoose';
/**
 * PhaseStatus Interface - Track which phases have been completed/confirmed
 */
export interface IPhaseStatus {
    phase1Confirmed: boolean;
    phase2Confirmed: boolean;
    phase3Confirmed: boolean;
}
/**
 * Idea Interface - TypeScript type definition
 */
export interface IIdea extends Document {
    userId: mongoose.Types.ObjectId;
    title: string;
    description: string;
    phase: 'Phase 1' | 'Phase 2' | 'Phase 3';
    phaseStatus: IPhaseStatus;
    version: number;
    archived: boolean;
    killAssumption?: string;
    createdAt: Date;
    updatedAt: Date;
}
/**
 * Create and export Idea model
 */
export declare const Idea: mongoose.Model<IIdea, {}, {}, {}, mongoose.Document<unknown, {}, IIdea> & IIdea & {
    _id: mongoose.Types.ObjectId;
}, any>;
//# sourceMappingURL=Idea.d.ts.map