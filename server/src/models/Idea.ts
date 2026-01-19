import mongoose, { Schema, Document } from 'mongoose';

/**
 * Competitor Interface - For competitive analysis
 */
export interface ICompetitor {
  name: string;
  difference: string;
  advantage: string;
}

/**
 * Market Feasibility Interface - For Phase 1 market analysis
 */
export interface IMarketFeasibility {
  marketSize: string;
  growthTrajectory: string;
  keyTrends: string[];
  timing: 'Now' | 'Soon' | 'Waiting';
}

/**
 * Phase 1 Data Interface - All Phase 1 validation outputs
 */
export interface IPhase1Data {
  cleanSummary?: string;
  marketFeasibility?: IMarketFeasibility;
  competitiveAnalysis?: ICompetitor[];
  killAssumption?: string;
  killAssumptionTestGuidance?: string;
  generatedAt?: Date;
  confirmedAt?: Date;
}

/**
 * PhaseStatus Interface - Track which phases have been completed/confirmed
 *
 * Status flow:
 * - pending: Phase not started
 * - generated: Phase content generated, awaiting confirmation
 * - confirmed: Phase confirmed and locked
 * - locked: Phase not accessible (previous phase not confirmed)
 * - invalidated: Phase needs regeneration due to upstream changes
 */
export interface IPhaseStatus {
  phase1: 'pending' | 'generated' | 'confirmed';
  phase2: 'locked' | 'pending' | 'generated' | 'confirmed' | 'invalidated';
  phase3: 'locked' | 'pending' | 'generated' | 'confirmed' | 'invalidated';
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
  phase1Data?: IPhase1Data;
  version: number;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Idea Schema - MongoDB collection structure
 */
const IdeaSchema = new Schema<IIdea>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Idea title is required'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Idea description is required'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
      trim: true,
    },
    phase: {
      type: String,
      enum: ['Phase 1', 'Phase 2', 'Phase 3'],
      default: 'Phase 1',
    },
    phaseStatus: {
      phase1: {
        type: String,
        enum: ['pending', 'generated', 'confirmed'],
        default: 'pending',
      },
      phase2: {
        type: String,
        enum: ['locked', 'pending', 'generated', 'confirmed', 'invalidated'],
        default: 'locked',
      },
      phase3: {
        type: String,
        enum: ['locked', 'pending', 'generated', 'confirmed', 'invalidated'],
        default: 'locked',
      },
    },
    phase1Data: {
      cleanSummary: { type: String },
      marketFeasibility: {
        marketSize: { type: String },
        growthTrajectory: { type: String },
        keyTrends: [{ type: String }],
        timing: { type: String, enum: ['Now', 'Soon', 'Waiting'] },
      },
      competitiveAnalysis: [
        {
          name: { type: String },
          difference: { type: String },
          advantage: { type: String },
        },
      ],
      killAssumption: { type: String },
      killAssumptionTestGuidance: { type: String },
      generatedAt: { type: Date },
      confirmedAt: { type: Date },
    },
    version: {
      type: Number,
      default: 1,
      min: 1,
    },
    archived: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Create and export Idea model
 */
export const Idea = mongoose.model<IIdea>('Idea', IdeaSchema);
