import mongoose, { Document } from 'mongoose';
import { IPhase1Data, IPhase2Data, IPhaseStatus } from './Idea';
export interface IVersion extends Document {
    ideaId: mongoose.Types.ObjectId;
    versionNumber: number;
    isActive: boolean;
    title: string;
    description: string;
    phase: string;
    phaseStatus: IPhaseStatus;
    phase1Data?: IPhase1Data;
    phase2Data?: IPhase2Data;
    phase3Data?: {
        pitchDeck?: string;
        changelog?: string;
        generatedAt?: Date;
        confirmedAt?: Date;
    };
    changeType: 'initial' | 'edit' | 'phase1_generated' | 'phase1_confirmed' | 'phase2_generated' | 'phase2_confirmed' | 'phase3_generated' | 'phase3_confirmed';
    changeSummary: string;
    createdAt: Date;
}
export interface IVersionModel extends mongoose.Model<IVersion> {
    createVersion(ideaId: mongoose.Types.ObjectId, ideaSnapshot: Partial<IVersion>, changeType: IVersion['changeType'], changeSummary: string): Promise<IVersion>;
    getHistory(ideaId: mongoose.Types.ObjectId, page?: number, limit?: number): Promise<{
        versions: IVersion[];
        total: number;
        pages: number;
    }>;
}
declare const Version: IVersionModel;
export default Version;
//# sourceMappingURL=Version.d.ts.map