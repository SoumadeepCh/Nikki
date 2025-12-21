import mongoose, { Schema, Document } from 'mongoose';

export interface IVentWord extends Document {
    userId: mongoose.Types.ObjectId;
    word: string;
    createdAt: Date;
}

const VentWordSchema = new Schema<IVentWord>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    word: {
        type: String,
        required: true,
        maxlength: 50
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index for efficient querying by user
VentWordSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.VentWord || mongoose.model<IVentWord>('VentWord', VentWordSchema);
