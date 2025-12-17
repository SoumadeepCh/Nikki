'use server';

import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Entry, { IEntry } from '@/models/Entry';
import { startOfDay, endOfDay, startOfMonth, endOfMonth } from 'date-fns';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { encrypt, decrypt } from '@/lib/encryption';

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
        const startDate = startOfMonth(new Date(year, month));
        const endDate = endOfMonth(new Date(year, month));

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
        const date = new Date(dateStr);
        const start = startOfDay(date);
        const end = endOfDay(date);

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
        };
    } catch (error) {
        console.error('Failed to fetch entry:', error);
        return null;
    }
}

export async function saveEntry(dateStr: string, content: string, moodColor: string) {
    try {
        const session = await getSession();
        if (!session) throw new Error('Unauthorized');

        await connectDB();
        const date = new Date(dateStr);
        const start = startOfDay(date);
        const end = endOfDay(date);

        // Upsert: Try to update first, if not found, create new
        const query: any = {
            userId: session.userId,
            date: { $gte: start, $lte: end }
        };

        const encryptedContent = encrypt(content); // Encrypt on write

        const updatedEntry = await Entry.findOneAndUpdate(
            query,
            {
                userId: session.userId,
                date: start,
                content: encryptedContent,
                moodColor
            },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        ).lean();

        return {
            _id: updatedEntry._id.toString(),
            date: updatedEntry.date,
            content: decrypt(updatedEntry.content), // Return decrypted content to client
            moodColor: updatedEntry.moodColor,
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
        const date = new Date(dateStr);
        const start = startOfDay(date);
        const end = endOfDay(date);

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
