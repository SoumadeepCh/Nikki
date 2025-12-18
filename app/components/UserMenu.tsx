'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, Settings, User } from 'lucide-react';
import { logout } from '@/app/auth/actions';

interface UserMenuProps {
    userName: string;
    onOpenProfile: () => void;
    onOpenSettings: () => void;
}

export default function UserMenu({ userName, onOpenProfile, onOpenSettings }: UserMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const initial = userName.charAt(0).toUpperCase();
    const [mounted, setMounted] = useState(false);

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
                    <p className="text-xs text-white/50">Personal Diary</p>
                </div>

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

                <div className="p-2 border-t border-white/10 bg-red-500/5">
                    <button
                        onClick={() => logout()}
                        className="w-full text-left px-3 py-2 text-sm text-red-300 hover:text-red-200 hover:bg-red-500/10 rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <LogOut size={16} />
                        Sign out
                    </button>
                </div>
            </motion.div>
        </div>
    );

    return (
        <>
            <button
                ref={buttonRef}
                onClick={toggleMenu}
                className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center text-white font-semibold text-lg hover:bg-violet-500 transition-colors shadow-lg border border-white/10 relative z-50"
            >
                {initial}
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
