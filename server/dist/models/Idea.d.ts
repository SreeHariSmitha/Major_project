import mongoose, { Document } from 'mongoose';
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
 * Create and export Idea model
 */
export declare const Idea: mongoose.Model<IIdea, {}, {}, {}, mongoose.Document<unknown, {}, IIdea> & IIdea & {
    _id: mongoose.Types.ObjectId;
}, any>;
//# sourceMappingURL=Idea.d.ts.map