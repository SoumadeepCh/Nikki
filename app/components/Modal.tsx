'use client';

import { useEffect, useRef } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
    const overlayRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    // Close on escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            // Prevent scrolling on body when modal is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    // Handle click outside
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (overlayRef.current === e.target) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            ref={overlayRef}
            onClick={handleBackdropClick}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
        >
            <div
                ref={contentRef}
                className="w-full max-w-lg relative animate-in zoom-in-95 duration-200"
            >
                {/* Checkered glass effect card */}
                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-neutral-950/85 shadow-2xl backdrop-blur-xl">

                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                        <h3 className="text-xl font-semibold text-white/90">{title}</h3>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>

                    {/* Body */}
                    <div className="px-6 py-6">
                        {children}
                    </div>

                    {/* Decorative Background Gradients */}
                    <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10">
                        <div className="absolute top-[-50%] left-[-50%] w-full h-full bg-accent/10 blur-[100px]" />
                        <div className="absolute bottom-[-50%] right-[-50%] w-full h-full bg-fuchsia-500/10 blur-[100px]" />
                    </div>
                </div>
            </div>
        </div>
    );
}
