'use client';

import Modal from './Modal';

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
}

export default function ProfileModal({ isOpen, onClose, userName, email = 'user@example.com', stats }: ProfileModalProps) {
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
                    <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-pink-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative w-24 h-24 rounded-full bg-black/40 flex items-center justify-center border border-white/10 text-3xl font-bold text-white shadow-2xl">
                        {initials}
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-white mb-1">{userName}</h2>
                <p className="text-white/40 mb-8">{email}</p>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 w-full">
                    <div className="bg-white/5 border border-white/5 rounded-xl p-4 text-center hover:bg-white/10 transition-colors">
                        <div className="text-2xl font-bold text-violet-400 mb-1">🔥 {stats.streak}</div>
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
