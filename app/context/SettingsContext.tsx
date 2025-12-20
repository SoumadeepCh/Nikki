'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { updateSettings as updateSettingsAction } from '../actions';
import { toast } from 'sonner';

interface Settings {
    themeColor: string;
    reducedMotion: boolean;
}

interface SettingsContextType {
    settings: Settings;
    updateSettings: (newSettings: Partial<Settings>) => Promise<void>;
    isLoading: boolean;
}

const defaultSettings: Settings = {
    themeColor: 'violet',
    reducedMotion: false,
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({
    children,
    initialSettings
}: {
    children: ReactNode;
    initialSettings?: Settings;
}) {
    const [settings, setSettings] = useState<Settings>(initialSettings || defaultSettings);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Apply theme color to root
        const root = document.documentElement;
        // Remove existing theme classes
        root.classList.remove('theme-violet', 'theme-teal', 'theme-orange');
        // Add new one
        root.classList.add(`theme-${settings.themeColor}`);
    }, [settings.themeColor]);

    const updateSettings = async (newSettings: Partial<Settings>) => {
        const updated = { ...settings, ...newSettings };
        setSettings(updated);

        setIsLoading(true);
        try {
            await updateSettingsAction(updated);
        } catch (error) {
            console.error('Failed to sync settings:', error);
            toast.error('Failed to save settings');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSettings, isLoading }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
