import mongoose, { Schema } from 'mongoose';
/**
 * Idea Schema - MongoDB collection structure
 */
const IdeaSchema = new Schema({
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
}, {
    timestamps: true,
});
/**
 * Create and export Idea model
 */
export const Idea = mongoose.model('Idea', IdeaSchema);
//# sourceMappingURL=Idea.js.map