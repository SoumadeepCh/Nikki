'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import LocalLockOverlay from './LocalLockOverlay';

interface LocalLockContextType {
    isLocked: boolean;
    hasPIN: boolean;
    lock: () => void;
    unlock: (pin: string) => boolean;
    setPIN: (pin: string) => void;
    clearPIN: () => void;
}

const LocalLockContext = createContext<LocalLockContextType | undefined>(undefined);

export const useLocalLock = () => {
    const context = useContext(LocalLockContext);
    if (!context) {
        throw new Error('useLocalLock must be used within a LocalLockProvider');
    }
    return context;
};

export default function LocalLockProvider({ children }: { children: React.ReactNode }) {
    const [isLocked, setIsLocked] = useState(false);
    const [hasPIN, setHasPIN] = useState(false);
    const [storedPIN, setStoredPIN] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const pin = localStorage.getItem('nikki_pin');
        if (pin) {
            setHasPIN(true);
            setStoredPIN(pin);
            setIsLocked(true);
        }
    }, []);

    const lock = () => {
        if (hasPIN) setIsLocked(true);
    };

    const unlock = (pin: string) => {
        if (pin === storedPIN) {
            setIsLocked(false);
            return true;
        }
        return false;
    };

    const setPIN = (pin: string) => {
        localStorage.setItem('nikki_pin', pin);
        setStoredPIN(pin);
        setHasPIN(true);
        setIsLocked(false);
    };

    const clearPIN = () => {
        localStorage.removeItem('nikki_pin');
        setStoredPIN(null);
        setHasPIN(false);
        setIsLocked(false);
    };

    // Force unlock for recovery (to be called after password verification)
    const forceUnlock = () => {
        setIsLocked(false);
    };

    const value = {
        isLocked,
        hasPIN,
        lock,
        unlock,
        setPIN,
        clearPIN,
        forceUnlock
    };

    return (
        <LocalLockContext.Provider value={value}>
            {children}
            {mounted && isLocked && <LocalLockOverlay onUnlock={unlock} onForceUnlock={forceUnlock} />}
        </LocalLockContext.Provider>
    );
}
