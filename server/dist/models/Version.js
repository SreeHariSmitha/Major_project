import mongoose, { Schema } from 'mongoose';
const VersionSchema = new Schema({
    ideaId: {
        type: Schema.Types.ObjectId,
        ref: 'Idea',
        required: true,
        index: true,
    },
    versionNumber: {
        type: Number,
        required: true,
        min: 1,
    },
    isActive: {
        type: Boolean,
        default: false,
    },
    // Snapshot fields
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    phase: {
        type: String,
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
        cleanSummary: String,
        marketFeasibility: {
            marketSize: String,
            growthTrajectory: String,
            keyTrends: [String],
            timing: {
                type: String,
                enum: ['Now', 'Soon', 'Waiting'],
            },
        },
        competitiveAnalysis: [{
                name: String,
                difference: String,
                advantage: String,
            }],
        killAssumption: String,
        killAssumptionTestGuidance: String,
        generatedAt: Date,
        confirmedAt: Date,
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
        generatedAt: Date,
        confirmedAt: Date,
    },
    phase3Data: {
        pitchDeck: String,
        changelog: String,
        generatedAt: Date,
        confirmedAt: Date,
    },
    // Version metadata
    changeType: {
        type: String,
        enum: ['initial', 'edit', 'phase1_generated', 'phase1_confirmed', 'phase2_generated', 'phase2_confirmed', 'phase3_generated', 'phase3_confirmed'],
        required: true,
    },
    changeSummary: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});
// Compound index for efficient queries
VersionSchema.index({ ideaId: 1, versionNumber: -1 });
VersionSchema.index({ ideaId: 1, isActive: 1 });
// Static method to create a new version
VersionSchema.statics.createVersion = async function (ideaId, ideaSnapshot, changeType, changeSummary) {
    // Get the latest version number
    const latestVersion = await this.findOne({ ideaId })
        .sort({ versionNumber: -1 })
        .select('versionNumber');
    const newVersionNumber = latestVersion ? latestVersion.versionNumber + 1 : 1;
    // Mark all previous versions as inactive
    await this.updateMany({ ideaId, isActive: true }, { isActive: false });
    // Create new version
    const version = new this({
        ideaId,
        versionNumber: newVersionNumber,
        isActive: true,
        changeType,
        changeSummary,
        ...ideaSnapshot,
    });
    return version.save();
};
// Static method to get version history
VersionSchema.statics.getHistory = async function (ideaId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [versions, total] = await Promise.all([
        this.find({ ideaId })
            .sort({ versionNumber: -1 })
            .skip(skip)
            .limit(limit)
            .select('versionNumber isActive changeType changeSummary createdAt'),
        this.countDocuments({ ideaId }),
    ]);
    return {
        versions,
        total,
        pages: Math.ceil(total / limit),
    };
};
const Version = mongoose.model('Version', VersionSchema);
export default Version;
//# sourceMappingURL=Version.js.map