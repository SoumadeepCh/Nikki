import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEntry extends Document {
    date: Date;
    content: string;
    moodColor: string;
    userId: Schema.Types.ObjectId;
    images?: string[];
    createdAt: Date;
    updatedAt: Date;
}

const EntrySchema: Schema = new Schema({
    date: {
        type: Date,
        required: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    content: {
        type: String,
        required: [true, 'Please provide some content for your diary entry.'],
    },
    moodColor: {
        type: String,
        default: '#8b5cf6' // Default violet
    },
    images: {
        type: [String],
        default: []
    }
}, {
    timestamps: true,
});

// Compound unique index: One entry per day per user
EntrySchema.index({ date: 1, userId: 1 }, { unique: true });

// Helper to handle Next.js hot reloading (prevent overwriting models)
const Entry: Model<IEntry> = mongoose.models.Entry || mongoose.model<IEntry>('Entry', EntrySchema);

export default Entry;
