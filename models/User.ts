import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    settings?: {
        themeColor: string;
        reducedMotion: boolean;
    };
    profileImage?: string;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema({
    name: {
        type: String,
        required: [true, 'Please provide a name'],
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
    },
    password: {
        type: String,
        select: false, // Don't return password by default
    },
    settings: {
        themeColor: { type: String, default: 'violet' },
        reducedMotion: { type: Boolean, default: false }
    },
    profileImage: { type: String, default: null },
}, {
    timestamps: true,
});

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
