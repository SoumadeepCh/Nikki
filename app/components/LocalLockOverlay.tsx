'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, KeyRound, Loader2, AlertCircle } from 'lucide-react';
import { verifyPassword } from '../actions';
import { toast } from 'sonner';

interface LocalLockOverlayProps {
    onUnlock: (pin: string) => boolean;
    onForceUnlock: () => void;
}

export default function LocalLockOverlay({ onUnlock, onForceUnlock }: LocalLockOverlayProps) {
    const [pin, setPin] = useState(['', '', '', '']);
    const [error, setError] = useState(false);
    const [showRecovery, setShowRecovery] = useState(false);
    const [password, setPassword] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (!showRecovery) {
            inputRefs.current[0]?.focus();
        }
    }, [showRecovery]);

    const handlePinChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        const newPin = [...pin];
        newPin[index] = value.slice(-1);
        setPin(newPin);
        setError(false);

        if (value && index < 3) {
            inputRefs.current[index + 1]?.focus();
        }

        if (newPin.every(digit => digit !== '')) {
            const success = onUnlock(newPin.join(''));
            if (!success) {
                setError(true);
                setPin(['', '', '', '']);
                inputRefs.current[0]?.focus();
                toast.error('Incorrect PIN');
            }
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !pin[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleRecovery = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsVerifying(true);
        try {
            const result = await verifyPassword(password);
            if (result.success) {
                toast.success('Identity verified. App unlocked.');
                onForceUnlock();
            } else {
                toast.error('Incorrect password');
            }
        } catch (err) {
            toast.error('Something went wrong');
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-neutral-950/80 backdrop-blur-xl"
        >
            <div className="w-full max-w-md p-8 text-center">
                <AnimatePresence mode="wait">
                    {!showRecovery ? (
                        <motion.div
                            key="pin"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="space-y-8"
                        >
                            <div className="relative inline-block">
                                <div className="absolute -inset-4 bg-accent/20 rounded-full blur-2xl animate-pulse"></div>
                                <div className="relative bg-neutral-900 w-20 h-20 rounded-2xl flex items-center justify-center border border-white/10 mx-auto mb-4">
                                    <Lock className="w-8 h-8 text-white" />
                                </div>
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">Privacy Lock</h2>
                                <p className="text-white/40">Enter your 4-digit PIN to continue</p>
                            </div>

                            <div className="flex justify-center gap-4">
                                {pin.map((digit, idx) => (
                                    <input
                                        key={idx}
                                        ref={el => { inputRefs.current[idx] = el; }}
                                        type="password"
                                        maxLength={1}
                                        value={digit}
                                        onChange={e => handlePinChange(idx, e.target.value)}
                                        onKeyDown={e => handleKeyDown(idx, e)}
                                        className={`w-14 h-18 bg-white/5 border-2 rounded-xl text-center text-2xl font-bold text-white outline-none transition-all
                                            ${error ? 'border-red-500/50 animate-shake' : 'border-white/10 focus:border-accent focus:bg-white/10'}
                                        `}
                                    />
                                ))}
                            </div>

                            <button
                                onClick={() => setShowRecovery(true)}
                                className="text-white/30 text-sm hover:text-white/60 transition-colors"
                            >
                                Forgot PIN? Use account password
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="recovery"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="space-y-8"
                        >
                            <div className="bg-neutral-900 w-20 h-20 rounded-2xl flex items-center justify-center border border-white/10 mx-auto">
                                <KeyRound className="w-8 h-8 text-accent" />
                            </div>

                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">Recovery</h2>
                                <p className="text-white/40">Enter your account password to unlock</p>
                            </div>

                            <form onSubmit={handleRecovery} className="space-y-4">
                                <input
                                    type="password"
                                    placeholder="Account Password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-accent transition-all"
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    disabled={isVerifying}
                                    className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-neutral-200 transition-all flex items-center justify-center gap-2"
                                >
                                    {isVerifying ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Unlock'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowRecovery(false)}
                                    className="text-white/30 text-sm hover:text-white/60 transition-colors"
                                >
                                    Go back to PIN entry
                                </button>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

// Add animation to globals.css if not exists or use inline style for shake
if (typeof document !== 'undefined' && !document.getElementById('lock-shake-style')) {
    const style = document.createElement('style');
    style.id = 'lock-shake-style';
    style.innerHTML = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
            20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both; }
    `;
    document.head.appendChild(style);
}
