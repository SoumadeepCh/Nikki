import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is undefined. Please check your .env file.');
    process.exit(1);
}

async function fixIndexes() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI as string);
        console.log('✅ Connected.');

        const collection = mongoose.connection.collection('entries');

        // List indexes
        const indexes = await collection.indexes();
        console.log('Current indexes:', indexes.map(i => i.name));

        // Drop the problematic index "date_1"
        const legacyIndexName = 'date_1';
        const indexExists = indexes.some(idx => idx.name === legacyIndexName);

        if (indexExists) {
            console.log(`Found legacy index "${legacyIndexName}". Dropping it...`);
            await collection.dropIndex(legacyIndexName);
            console.log(`✅ Successfully dropped "${legacyIndexName}".`);
        } else {
            console.log(`Index "${legacyIndexName}" not found. Database is likely already clean.`);
        }

    } catch (error) {
        console.error('❌ Error during migration:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected.');
        process.exit(0);
    }
}

fixIndexes();
