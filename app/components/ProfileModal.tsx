'use client';

import Modal from './Modal';
import { Camera, Loader2 } from 'lucide-react';
import { updateProfileImage } from '../actions';
import { uploadImage } from '../utils/cloudinary';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    userName: string;
    email?: string;
    stats: {
        totalEntries: number;
        streak: number;
        frequentMood: string;
    };
    profileImage?: string;
    onUpdateImage?: (url: string) => void;
}

export default function ProfileModal({ isOpen, onClose, userName, email = 'user@example.com', stats, profileImage, onUpdateImage }: ProfileModalProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);
    const initials = userName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Your Profile">
            <div className="flex flex-col items-center">
                {/* Avatar with Glow */}
                <div className="relative mb-6 group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-accent to-pink-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative w-24 h-24 rounded-full bg-neutral-900 flex items-center justify-center border border-white/10 text-3xl font-bold text-white shadow-2xl overflow-hidden">
                        {profileImage ? (
                            <img src={profileImage} alt={userName} className="w-full h-full object-cover" />
                        ) : (
                            initials
                        )}

                        {/* Upload Overlay */}
                        {mounted && (
                            <div className="absolute inset-0">
                                <input
                                    type="file"
                                    id="profile-image-upload"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;

                                        setIsUploading(true);
                                        try {
                                            const result = await uploadImage(file);
                                            const url = result.secure_url;
                                            await updateProfileImage(url);
                                            onUpdateImage?.(url);
                                            toast.success('Profile image updated!');
                                        } catch (error: any) {
                                            toast.error(error.message || 'Upload failed');
                                        } finally {
                                            setIsUploading(false);
                                            e.target.value = '';
                                        }
                                    }}
                                />
                                <button
                                    onClick={() => document.getElementById('profile-image-upload')?.click()}
                                    disabled={isUploading}
                                    className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-100 disabled:cursor-wait"
                                >
                                    {isUploading ? (
                                        <Loader2 size={24} className="animate-spin mb-1" />
                                    ) : (
                                        <>
                                            <Camera size={24} className="mb-1" />
                                            <span className="text-[10px] uppercase tracking-widest font-bold">Update</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-white mb-1">{userName}</h2>
                <p className="text-white/40 mb-8">{email}</p>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 w-full">
                    <div className="bg-white/5 border border-white/5 rounded-xl p-4 text-center hover:bg-white/10 transition-colors">
                        <div className="text-2xl font-bold text-accent mb-1">🔥 {stats.streak}</div>
                        <div className="text-xs text-white/40 uppercase tracking-wide">Day Streak</div>
                    </div>
                    <div className="bg-white/5 border border-white/5 rounded-xl p-4 text-center hover:bg-white/10 transition-colors">
                        <div className="text-2xl font-bold text-pink-400 mb-1">📝 {stats.totalEntries}</div>
                        <div className="text-xs text-white/40 uppercase tracking-wide">Entries</div>
                    </div>
                    <div className="bg-white/5 border border-white/5 rounded-xl p-4 text-center hover:bg-white/10 transition-colors">
                        <div className="flex items-center justify-center h-8 mb-1">
                            <div className="w-6 h-6 rounded-full shadow-lg ring-2 ring-white/10" style={{ backgroundColor: stats.frequentMood }}></div>
                        </div>
                        <div className="text-xs text-white/40 uppercase tracking-wide">Mood</div>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
