import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || ''; // Must be 256 bits (32 characters)
const IV_LENGTH = 16; // For AES, this is always 16

function getKey() {
    if (!ENCRYPTION_KEY) {
        throw new Error('ENCRYPTION_KEY is not defined in .env');
    }
    // Handle both hex and utf8 keys
    return Buffer.from(ENCRYPTION_KEY, 'hex').length === 32
        ? Buffer.from(ENCRYPTION_KEY, 'hex')
        : crypto.createHash('sha256').update(String(ENCRYPTION_KEY)).digest();
}

export function encrypt(text: string): string {
    if (!text) return '';
    try {
        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv('aes-256-cbc', getKey(), iv);
        let encrypted = cipher.update(text);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        return iv.toString('hex') + ':' + encrypted.toString('hex');
    } catch (error) {
        console.error('Encryption failed:', error);
        return text; // Fallback to plain text on error (safer than data loss)
    }
}

export function decrypt(text: string): string {
    if (!text) return '';

    // Check if text is encrypted (format iv:content)
    const textParts = text.split(':');
    if (textParts.length !== 2) {
        // Not encrypted or invalid format, return as is (Legacy support)
        return text;
    }

    try {
        const iv = Buffer.from(textParts[0], 'hex');
        const encryptedText = Buffer.from(textParts[1], 'hex');
        const decipher = crypto.createDecipheriv('aes-256-cbc', getKey(), iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (error) {
        // Decryption failed (maybe key changed or data corruption), return original
        console.warn('Decryption failed, returning original text');
        return text;
    }
}
