'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Settings, User, LogIn } from 'lucide-react';
import { logout } from '@/app/auth/actions';
import { useRouter } from 'next/navigation';

interface UserMenuProps {
    userName: string;
    profileImage?: string;
    onOpenProfile: () => void;
    onOpenSettings: () => void;
    isGuest?: boolean;
}

export default function UserMenu({ userName, profileImage, onOpenProfile, onOpenSettings, isGuest = false }: UserMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const initial = userName.charAt(0).toUpperCase();
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    const buttonRef = useRef<HTMLButtonElement>(null);
    const [coords, setCoords] = useState<{ top: number; right: number } | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleMenu = () => {
        if (!isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setCoords({
                top: rect.bottom + 8,
                right: window.innerWidth - rect.right
            });
        }
        setIsOpen(!isOpen);
    };

    const menuContent = (
        <div className="fixed inset-0 z-[9999]">
            {/* Backdrop for click-outside */}
            <div
                className="absolute inset-0 bg-black/30 backdrop-blur-sm"
                onClick={() => setIsOpen(false)}
            />

            {/* Menu */}
            <motion.div
                style={{
                    top: coords?.top,
                    right: coords?.right
                }}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute w-64 glass rounded-xl border border-white/10 shadow-2xl overflow-hidden"
            >
                <div className="p-4 border-b border-white/10">
                    <p className="text-sm font-medium text-white">{userName}</p>
                    <p className="text-xs text-white/50">{isGuest ? 'Guest User' : 'Personal Diary'}</p>
                </div>

                {!isGuest && (
                    <div className="p-2 space-y-1">
                        <button
                            onClick={() => {
                                onOpenProfile();
                                setIsOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-lg flex items-center gap-2 transition-colors"
                        >
                            <User size={16} />
                            Profile
                        </button>
                        <button
                            onClick={() => {
                                onOpenSettings();
                                setIsOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-lg flex items-center gap-2 transition-colors"
                        >
                            <Settings size={16} />
                            Settings
                        </button>
                    </div>
                )}

                <div className="p-2 border-t border-white/10 bg-red-500/5">
                    {isGuest ? (
                        <button
                            onClick={() => {
                                router.push('/login');
                                setIsOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 text-sm text-green-300 hover:text-green-200 hover:bg-green-500/10 rounded-lg flex items-center gap-2 transition-colors"
                        >
                            <LogIn size={16} />
                            Sign In / Register
                        </button>
                    ) : (
                        <button
                            onClick={() => logout()}
                            className="w-full text-left px-3 py-2 text-sm text-red-300 hover:text-red-200 hover:bg-red-500/10 rounded-lg flex items-center gap-2 transition-colors"
                        >
                            <LogOut size={16} />
                            Sign out
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );

    return (
        <>
            <button
                ref={buttonRef}
                onClick={toggleMenu}
                className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-white font-semibold text-lg hover:bg-accent/90 transition-colors shadow-lg border border-white/10 relative z-50 overflow-hidden"
            >
                {profileImage ? (
                    <img src={profileImage} alt={userName} className="w-full h-full object-cover" />
                ) : (
                    initial
                )}
            </button>

            {mounted && createPortal(
                <AnimatePresence>
                    {isOpen && menuContent}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
}
