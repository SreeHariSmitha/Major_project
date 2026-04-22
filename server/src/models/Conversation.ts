import mongoose, { Document, Schema } from 'mongoose';

/**
 * Chat message stored per idea. `proposal` is populated when the assistant
 * suggests a section regeneration; `applied` flips true once the user
 * confirms and the section is regenerated + a new version is written.
 */
export interface IChatMessage {
  role: 'user' | 'assistant';
  content: string;
  proposal?: {
    section: string;
    feedback: string;
    applied: boolean;
  };
  createdAt: Date;
}

export interface IConversation extends Document {
  ideaId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  messages: IChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    proposal: {
      section: { type: String },
      feedback: { type: String },
      applied: { type: Boolean, default: false },
    },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const ConversationSchema = new Schema<IConversation>(
  {
    ideaId: { type: Schema.Types.ObjectId, ref: 'Idea', required: true, index: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    messages: { type: [ChatMessageSchema], default: [] },
  },
  { timestamps: true },
);

const Conversation = mongoose.model<IConversation>('Conversation', ConversationSchema);
export default Conversation;
