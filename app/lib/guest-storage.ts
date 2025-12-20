export interface GuestEntry {
    date: string; // ISO string or YYYY-MM-DD
    content: string;
    moodColor: string;
}

const STORAGE_KEY = 'nikki_entries';

export function getAllGuestEntries(): GuestEntry[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    try {
        return JSON.parse(stored);
    } catch {
        return [];
    }
}

export function saveGuestEntry(date: string, content: string, moodColor: string): GuestEntry {
    const entries = getAllGuestEntries();
    // Normalize date to YYYY-MM-DD to match valid comparison
    // Assuming date comes in as YYYY-MM-DD from the editor/calendar
    const existingIndex = entries.findIndex(e => e.date === date);

    const newEntry = { date, content, moodColor };

    if (existingIndex >= 0) {
        entries[existingIndex] = newEntry;
    } else {
        entries.push(newEntry);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    return newEntry;
}

export function getGuestEntryByDate(date: string): GuestEntry | null {
    const entries = getAllGuestEntries();
    return entries.find(e => e.date === date) || null;
}

export function deleteGuestEntry(date: string): void {
    const entries = getAllGuestEntries();
    const filtered = entries.filter(e => e.date !== date);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

// Helper to filter by month for the calendar
export function getGuestMonthEntries(year: number, month: number): GuestEntry[] {
    const entries = getAllGuestEntries();
    return entries.filter(entry => {
        const d = new Date(entry.date);
        return d.getFullYear() === year && d.getMonth() === month;
    });
}

export function clearGuestEntries() {
    localStorage.removeItem(STORAGE_KEY);
}
