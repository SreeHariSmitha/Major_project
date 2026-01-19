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
 * Business Model Interface - For Phase 2 business model canvas
 */
export interface IBusinessModel {
  customerSegments: string;
  valueProposition: string;
  revenueStreams: string;
  costStructure: string;
  keyPartnerships: string;
  keyResources: string;
}

/**
 * Strategy Interface - For Phase 2 go-to-market strategy
 */
export interface IStrategy {
  customerAcquisition: string;
  pricingStrategy: string;
  growthStrategy: string;
  keyMilestones: string[];
}

/**
 * Risk Interface - For structural and operational risks
 */
export interface IRisk {
  name: string;
  description: string;
  implications: string;
}

/**
 * Phase 2 Data Interface - All Phase 2 business model outputs
 */
export interface IPhase2Data {
  businessModel?: IBusinessModel;
  strategy?: IStrategy;
  structuralRisks?: IRisk[];
  operationalRisks?: IRisk[];
  generatedAt?: Date;
  confirmedAt?: Date;
}

/**
 * Pitch Deck Slide Interface - Individual slide in the pitch deck
 */
export interface IPitchDeckSlide {
  slideNumber: number;
  title: string;
  content: string;
  speakerNotes?: string;
}

/**
 * Changelog Entry Interface - What changed between versions
 */
export interface IChangelogEntry {
  section: string;
  changeType: 'added' | 'modified' | 'removed';
  description: string;
}

/**
 * Phase 3 Data Interface - Pitch Deck and Changelog
 */
export interface IPhase3Data {
  pitchDeck?: {
    titleSlide: IPitchDeckSlide;
    problemSlide: IPitchDeckSlide;
    solutionSlide: IPitchDeckSlide;
    marketOpportunitySlide: IPitchDeckSlide;
    businessModelSlide: IPitchDeckSlide;
    tractionSlide: IPitchDeckSlide;
    competitionSlide: IPitchDeckSlide;
    teamSlide: IPitchDeckSlide;
    financialsSlide: IPitchDeckSlide;
    askSlide: IPitchDeckSlide;
  };
  changelog?: IChangelogEntry[];
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
  phase2Data?: IPhase2Data;
  phase3Data?: IPhase3Data;
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
    phase2Data: {
      businessModel: {
        customerSegments: { type: String },
        valueProposition: { type: String },
        revenueStreams: { type: String },
        costStructure: { type: String },
        keyPartnerships: { type: String },
        keyResources: { type: String },
      },
      strategy: {
        customerAcquisition: { type: String },
        pricingStrategy: { type: String },
        growthStrategy: { type: String },
        keyMilestones: [{ type: String }],
      },
      structuralRisks: [
        {
          name: { type: String },
          description: { type: String },
          implications: { type: String },
        },
      ],
      operationalRisks: [
        {
          name: { type: String },
          description: { type: String },
          implications: { type: String },
        },
      ],
      generatedAt: { type: Date },
      confirmedAt: { type: Date },
    },
    phase3Data: {
      pitchDeck: {
        titleSlide: {
          slideNumber: { type: Number },
          title: { type: String },
          content: { type: String },
          speakerNotes: { type: String },
        },
        problemSlide: {
          slideNumber: { type: Number },
          title: { type: String },
          content: { type: String },
          speakerNotes: { type: String },
        },
        solutionSlide: {
          slideNumber: { type: Number },
          title: { type: String },
          content: { type: String },
          speakerNotes: { type: String },
        },
        marketOpportunitySlide: {
          slideNumber: { type: Number },
          title: { type: String },
          content: { type: String },
          speakerNotes: { type: String },
        },
        businessModelSlide: {
          slideNumber: { type: Number },
          title: { type: String },
          content: { type: String },
          speakerNotes: { type: String },
        },
        tractionSlide: {
          slideNumber: { type: Number },
          title: { type: String },
          content: { type: String },
          speakerNotes: { type: String },
        },
        competitionSlide: {
          slideNumber: { type: Number },
          title: { type: String },
          content: { type: String },
          speakerNotes: { type: String },
        },
        teamSlide: {
          slideNumber: { type: Number },
          title: { type: String },
          content: { type: String },
          speakerNotes: { type: String },
        },
        financialsSlide: {
          slideNumber: { type: Number },
          title: { type: String },
          content: { type: String },
          speakerNotes: { type: String },
        },
        askSlide: {
          slideNumber: { type: Number },
          title: { type: String },
          content: { type: String },
          speakerNotes: { type: String },
        },
      },
      changelog: [
        {
          section: { type: String },
          changeType: { type: String, enum: ['added', 'modified', 'removed'] },
          description: { type: String },
        },
      ],
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
