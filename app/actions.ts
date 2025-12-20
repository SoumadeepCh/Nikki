'use server';

import mongoose from 'mongoose';
import { revalidatePath } from 'next/cache';
import connectDB from '@/lib/db';
import Entry, { IEntry } from '@/models/Entry';
import User from '@/models/User';
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { encrypt, decrypt } from '@/lib/encryption';
import bcrypt from 'bcryptjs';

async function getSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    if (!token) return null;
    return await verifyToken(token);
}

export async function getMonthEntries(year: number, month: number) {
    try {
        const session = await getSession();
        if (!session) return [];

        await connectDB();
        // Use UTC dates to avoid timezone shifting
        const startDate = new Date(Date.UTC(year, month, 1));
        const endDate = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));

        const query: any = {
            userId: session.userId,
            date: { $gte: startDate, $lte: endDate },
        };

        const entries = await Entry.find(query).lean();

        // Serialize for client
        return entries.map((entry) => ({
            _id: entry._id.toString(),
            date: entry.date,
            content: decrypt(entry.content), // Decrypt on read
            moodColor: entry.moodColor,
            images: entry.images || [],
        }));
    } catch (error) {
        console.error('Failed to fetch entries:', error);
        return [];
    }
}

export async function getEntryByDate(dateStr: string) {
    try {
        const session = await getSession();
        if (!session) return null;

        await connectDB();
        // dateStr is YYYY-MM-DD
        const start = new Date(dateStr); // Parses as UTC 00:00:00
        const end = new Date(start);
        end.setUTCHours(23, 59, 59, 999);

        const query: any = {
            userId: session.userId,
            date: { $gte: start, $lte: end },
        };

        const entry = await Entry.findOne(query).lean();

        if (!entry) return null;

        return {
            _id: entry._id.toString(),
            date: entry.date,
            content: decrypt(entry.content), // Decrypt on read
            moodColor: entry.moodColor,
            images: entry.images || [],
        };
    } catch (error) {
        console.error('Failed to fetch entry:', error);
        return null;
    }
}

export async function saveEntry(dateStr: string, content: string, moodColor: string, images: string[] = []) {
    try {
        const session = await getSession();
        if (!session) throw new Error('Unauthorized');

        await connectDB();
        // dateStr is YYYY-MM-DD
        const start = new Date(dateStr); // Parses as UTC 00:00:00
        const end = new Date(start);
        end.setUTCHours(23, 59, 59, 999);

        // Upsert: Try to update first, if not found, create new
        const query: any = {
            userId: session.userId,
            date: { $gte: start, $lte: end }
        };

        const encryptedContent = encrypt(content); // Encrypt on write

        const entry = await Entry.findOneAndUpdate(
            query,
            {
                $set: {
                    content: encryptedContent,
                    moodColor,
                    images,
                },
                // These fields are necessary for upsert to create a new document correctly
                $setOnInsert: {
                    userId: session.userId,
                    date: start,
                }
            },
            { upsert: true, new: true }
        ).lean();

        return {
            _id: entry._id.toString(),
            date: entry.date,
            content: decrypt(entry.content),
            moodColor: entry.moodColor,
            images: entry.images
        };
    } catch (error) {
        console.error('Failed to save entry:', error);
        throw new Error('Failed to save entry');
    }
}

export async function deleteEntry(dateStr: string) {
    try {
        const session = await getSession();
        if (!session) throw new Error('Unauthorized');

        await connectDB();
        // dateStr is YYYY-MM-DD
        const start = new Date(dateStr); // Parses as UTC 00:00:00
        const end = new Date(start);
        end.setUTCHours(23, 59, 59, 999);

        const query: any = {
            userId: session.userId,
            date: { $gte: start, $lte: end },
        };

        await Entry.findOneAndDelete(query);

        return { success: true };
    } catch (error) {
        console.error('Failed to delete entry:', error);
        throw new Error('Failed to delete entry');
    }
}

export async function getUserStats() {
    try {
        const session = await getSession();
        if (!session || !session.userId) return { totalEntries: 0, streak: 0, frequentMood: '#8b5cf6' };

        await connectDB();

        // 1. Total Entries
        const totalEntries = await Entry.countDocuments({ userId: session.userId } as any);

        // 2. Streak Calculation
        const entries = await Entry.find({ userId: session.userId } as any)
            .sort({ date: -1 })
            .select('date')
            .lean();

        let streak = 0;
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        if (entries.length > 0) {
            const latest = new Date(entries[0].date);
            const latestNormalized = new Date(latest.getFullYear(), latest.getMonth(), latest.getDate());

            // Check if latest entry is today or yesterday
            const diffFromToday = (today.getTime() - latestNormalized.getTime()) / (1000 * 60 * 60 * 24);

            if (diffFromToday <= 1) {
                streak = 1;
                let currentDate = latestNormalized;

                for (let i = 1; i < entries.length; i++) {
                    const prevEntryDate = new Date(entries[i].date);
                    const prevNormalized = new Date(prevEntryDate.getFullYear(), prevEntryDate.getMonth(), prevEntryDate.getDate());

                    const diff = (currentDate.getTime() - prevNormalized.getTime()) / (1000 * 60 * 60 * 24);

                    if (diff === 1) {
                        streak++;
                        currentDate = prevNormalized;
                    } else if (diff > 1) {
                        break;
                    }
                    // If diff === 0 (same day), continue loop without breaking or incrementing
                }
            }
        }

        // 3. Most Frequent Mood
        const moodAggregation = await Entry.aggregate([
            { $match: { userId: new mongoose.Types.ObjectId(session.userId as string) } },
            { $group: { _id: "$moodColor", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 1 }
        ]);

        const frequentMood = moodAggregation.length > 0 ? moodAggregation[0]._id : '#8b5cf6';

        return {
            totalEntries,
            streak,
            frequentMood
        };


    } catch (error) {
        console.error('Failed to fetch user stats:', error);
        return { totalEntries: 0, streak: 0, frequentMood: '#8b5cf6' };
    }
}

export async function syncGuestEntries(entries: { date: string; content: string; moodColor: string }[]) {
    try {
        const session = await getSession();
        if (!session) throw new Error('Unauthorized');

        await connectDB();

        const operations = entries.map(entry => {
            const start = new Date(entry.date);
            const end = new Date(start);
            end.setUTCHours(23, 59, 59, 999);

            const query: any = {
                userId: session.userId,
                date: { $gte: start, $lte: end }
            };

            const encryptedContent = encrypt(entry.content);

            return {
                updateOne: {
                    filter: query,
                    update: {
                        userId: session.userId,
                        date: start,
                        content: encryptedContent,
                        moodColor: entry.moodColor
                    },
                    upsert: true
                }
            };
        });

        if (operations.length > 0) {
            await Entry.bulkWrite(operations);
        }

        return { success: true, count: operations.length };
    } catch (error) {
        console.error('Failed to sync guest entries:', error);
        throw new Error('Failed to sync guest entries');
    }
}

export async function updateSettings(settings: { themeColor: string; reducedMotion: boolean }) {
    try {
        const session = await getSession();
        if (!session) throw new Error('Unauthorized');

        await connectDB();

        await User.findByIdAndUpdate(session.userId, {
            $set: { settings }
        });

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Failed to update settings:', error);
        throw new Error('Failed to update settings');
    }
}

export async function exportEntries() {
    try {
        const session = await getSession();
        if (!session) throw new Error('Unauthorized');

        await connectDB();

        const entries = await Entry.find({ userId: session.userId } as any).lean();

        const decryptedEntries = entries.map(entry => ({
            date: entry.date,
            content: decrypt(entry.content), // Decrypt for export
            moodColor: entry.moodColor,
            createdAt: (entry as any).createdAt
        }));

        return decryptedEntries;
    } catch (error) {
        console.error('Failed to export entries:', error);
        throw new Error('Failed to export entries');
    }
}

export async function changePassword(currentPassword: string, newPassword: string) {
    try {
        const session = await getSession();
        if (!session) throw new Error('Unauthorized');

        await connectDB();

        // Need to select password explicitly as it's hidden by default in schema
        const user = await User.findById(session.userId).select('+password');
        if (!user || !user.password) {
            return { success: false, error: 'User not found' };
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return { success: false, error: 'Incorrect current password' };
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        return { success: true };
    } catch (error) {
        console.error('Failed to change password:', error);
        return { success: false, error: 'Failed to update password' };
    }
}
export async function updateProfileImage(imageUrl: string) {
    try {
        const session = await getSession();
        if (!session) throw new Error('Unauthorized');

        await connectDB();

        await User.findByIdAndUpdate(session.userId, {
            $set: { profileImage: imageUrl }
        });

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Failed to update profile image:', error);
        throw new Error('Failed to update profile image');
    }
}

export async function verifyPassword(password: string) {
    try {
        const session = await getSession();
        if (!session) return { success: false, error: 'Unauthorized' };

        await connectDB();
        const user = await User.findById(session.userId).select('+password');
        if (!user || !user.password) {
            return { success: false, error: 'User not found' };
        }

        const isMatch = await bcrypt.compare(password, user.password);
        return { success: isMatch };
    } catch (error) {
        console.error('Failed to verify password:', error);
        return { success: false, error: 'Verification failed' };
    }
}
