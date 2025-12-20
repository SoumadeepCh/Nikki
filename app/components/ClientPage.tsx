'use client';

import { useState, useEffect } from 'react';
import Calendar from './Calendar';
import DiaryEditor from './DiaryEditor';
import { getMonthEntries, getEntryByDate, saveEntry, deleteEntry, syncGuestEntries } from '../actions';
import { Toaster, toast } from 'sonner';
import UserMenu from './UserMenu';
import ProfileModal from './ProfileModal';
import SettingsModal from './SettingsModal';
import { format } from 'date-fns';
import {
    getGuestMonthEntries,
    getGuestEntryByDate,
    saveGuestEntry,
    deleteGuestEntry,
    getAllGuestEntries,
    clearGuestEntries
} from '../lib/guest-storage';

interface ClientPageProps {
    userName: string;
    userEmail: string;
    profileImage?: string;
    stats: {
        totalEntries: number;
        streak: number;
        frequentMood: string;
    };
    isGuest?: boolean;
    initialSettings?: { themeColor: string; reducedMotion: boolean };
}

import { SettingsProvider } from '../context/SettingsContext';

export default function ClientPage({ userName, userEmail, profileImage: initialProfileImage, stats, isGuest = false, initialSettings }: ClientPageProps) {
    const [profileImage, setProfileImage] = useState(initialProfileImage);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const [entries, setEntries] = useState<{ date: string | Date; moodColor: string; images?: string[] }[]>([]);
    const [editorContent, setEditorContent] = useState('');
    const [editorColor, setEditorColor] = useState('#8b5cf6');
    const [editorImages, setEditorImages] = useState<string[]>([]);

    // Data Migration Effect
    useEffect(() => {
        const checkAndSyncGuestData = async () => {
            if (!isGuest) {
                const guestEntries = getAllGuestEntries();
                if (guestEntries && guestEntries.length > 0) {
                    const loadingToast = toast.loading('Syncing your guest entries...');
                    try {
                        await syncGuestEntries(guestEntries);
                        clearGuestEntries();
                        toast.success('Guest entries synced successfully!', { id: loadingToast });
                        // Refresh current view
                        fetchMonthEntries();
                    } catch (error) {
                        toast.error('Failed to sync guest entries', { id: loadingToast });
                    }
                }
            }
        };
        checkAndSyncGuestData();
    }, [isGuest]);

    // Fetch entries for the calendar month
    const fetchMonthEntries = async () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        if (isGuest) {
            const data = getGuestMonthEntries(year, month);
            setEntries(data);
        } else {
            const data = await getMonthEntries(year, month);
            setEntries(data);
        }
    };

    useEffect(() => {
        fetchMonthEntries();
    }, [currentDate, isGuest]);

    // Fetch specific entry when selected date changes
    useEffect(() => {
        const fetchEntry = async () => {
            const dateStr = format(selectedDate, 'yyyy-MM-dd');
            if (isGuest) {
                const data = getGuestEntryByDate(dateStr);
                if (data) {
                    setEditorContent(data.content);
                    setEditorColor(data.moodColor);
                    setEditorImages((data as any).images || []);
                } else {
                    setEditorContent('');
                    setEditorColor('#8b5cf6');
                    setEditorImages([]);
                }
            } else {
                const data = await getEntryByDate(dateStr);
                if (data) {
                    setEditorContent(data.content);
                    setEditorColor(data.moodColor);
                    setEditorImages(data.images || []);
                } else {
                    setEditorContent('');
                    setEditorColor('#8b5cf6');
                    setEditorImages([]);
                }
            }
        };
        fetchEntry();
    }, [selectedDate, isGuest]);

    const handleSave = async (content: string, color: string, images: string[] = []) => {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        let saved;

        if (isGuest) {
            saved = saveGuestEntry(dateStr, content, color);
        } else {
            saved = await saveEntry(dateStr, content, color, images);
        }

        // Optimistic or Real-time update of local entries
        setEntries(prev => {
            const filtered = prev.filter(e => new Date(e.date).toDateString() !== new Date(saved.date).toDateString());
            return [...filtered, {
                date: saved.date,
                moodColor: saved.moodColor,
                images: (saved as any).images || []
            }];
        });

        setEditorContent(saved.content);
        setEditorColor(saved.moodColor);
        setEditorImages((saved as any).images || []);
        if (isGuest) {
            toast.success('Entry saved locally');
        }
    };

    const handleDelete = async () => {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');

        if (isGuest) {
            deleteGuestEntry(dateStr);
        } else {
            await deleteEntry(dateStr);
        }

        // Update calendar state
        setEntries(prev => prev.filter(e => new Date(e.date).toDateString() !== selectedDate.toDateString()));

        // Reset editor
        setEditorContent('');
        setEditorImages([]);
        setEditorColor('#8b5cf6');
    };

    return (
        <SettingsProvider initialSettings={initialSettings}>
            <main className="min-h-screen p-8 lg:p-12 flex flex-col items-center justify-center relative overflow-hidden">
                {/* Background Ambience */}
                <div className="fixed inset-0 pointer-events-none z-0">
                    <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-accent/20 blur-[130px]" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-pink-600/20 blur-[130px]" />
                </div>

                <div className="fixed top-4 right-4 z-50">
                    <UserMenu
                        userName={userName}
                        profileImage={profileImage}
                        onOpenProfile={() => setIsProfileOpen(true)}
                        onOpenSettings={() => setIsSettingsOpen(true)}
                        isGuest={isGuest}
                    />
                </div>

                <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-16 items-start z-10">

                    {/* Left Col: Calendar & Info */}
                    <div className="flex flex-col gap-10 sticky top-10">
                        <div className="space-y-4">
                            <h1 className="text-7xl font-bold tracking-tighter text-white">
                                Nikki.
                            </h1>
                            <p className="text-white/40 text-lg font-light max-w-md leading-relaxed">
                                Capture the essence of your days. A digital sanctuary for your thoughts, moods, and memories.
                            </p>
                        </div>

                        <Calendar
                            currentDate={currentDate}
                            onDateSelect={(date) => {
                                setSelectedDate(date);
                                setCurrentDate(date);
                            }}
                            entries={entries}
                            selectedDate={selectedDate}
                        />
                    </div>

                    {/* Right Col: Editor */}
                    <div className="w-full pt-10 md:pt-0">
                        <DiaryEditor
                            date={selectedDate}
                            initialContent={editorContent}
                            initialColor={editorColor}
                            initialImages={editorImages}
                            onSave={handleSave}
                            onDelete={handleDelete}
                        />
                    </div>
                </div>

                <Toaster theme="dark" position="bottom-right" />

                {/* Modals */}
                <ProfileModal
                    isOpen={isProfileOpen}
                    onClose={() => setIsProfileOpen(false)}
                    userName={userName}
                    email={userEmail}
                    profileImage={profileImage}
                    onUpdateImage={(url: string) => setProfileImage(url)}
                    stats={stats}
                />
                <SettingsModal
                    isOpen={isSettingsOpen}
                    onClose={() => setIsSettingsOpen(false)}
                />
            </main>
        </SettingsProvider>
    );
}
