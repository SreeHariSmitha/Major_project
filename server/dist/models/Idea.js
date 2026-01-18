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
        phase1Confirmed: {
            type: Boolean,
            default: false,
        },
        phase2Confirmed: {
            type: Boolean,
            default: false,
        },
        phase3Confirmed: {
            type: Boolean,
            default: false,
        },
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
    killAssumption: {
        type: String,
        maxlength: [1000, 'Kill assumption cannot exceed 1000 characters'],
    },
}, {
    timestamps: true,
});
/**
 * Create and export Idea model
 */
export const Idea = mongoose.model('Idea', IdeaSchema);
//# sourceMappingURL=Idea.js.map