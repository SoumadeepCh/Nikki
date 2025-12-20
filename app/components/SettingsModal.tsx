'use client';

import { useState } from 'react';
import Modal from './Modal';
import { logout } from '../auth/actions';
import { exportEntries, updateSettings, changePassword } from '../actions';
import { useSettings } from '../context/SettingsContext';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { KeyRound, Download, LogOut, Loader2, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    const { settings, updateSettings, isLoading: settingsLoading } = useSettings();
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [pwdData, setPwdData] = useState({ current: '', new: '', confirm: '' });
    const [pwdStatus, setPwdStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error', message?: string }>({ type: 'idle' });

    const themes = [
        { id: 'violet', bg: 'bg-violet-500' },
        { id: 'teal', bg: 'bg-teal-500' },
        { id: 'orange', bg: 'bg-orange-500' },
    ];

    const handleExport = async () => {
        const loadingToast = toast.loading('Preparing your export...');
        try {
            const data = await exportEntries();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `nikki-export-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            toast.success('Export downloaded successfully!', { id: loadingToast });
        } catch (error) {
            toast.error('Failed to export entries', { id: loadingToast });
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (pwdData.new !== pwdData.confirm) {
            setPwdStatus({ type: 'error', message: 'Passwords do not match' });
            return;
        }
        if (pwdData.new.length < 6) {
            setPwdStatus({ type: 'error', message: 'Password must be at least 6 characters' });
            return;
        }

        setPwdStatus({ type: 'loading' });
        try {
            const result = await changePassword(pwdData.current, pwdData.new);
            if (result.success) {
                setPwdStatus({ type: 'success', message: 'Password changed successfully' });
                setPwdData({ current: '', new: '', confirm: '' });
                setTimeout(() => {
                    setIsChangingPassword(false);
                    setPwdStatus({ type: 'idle' });
                }, 2000);
            } else {
                setPwdStatus({ type: 'error', message: result.error || 'Failed to change password' });
            }
        } catch (error: any) {
            setPwdStatus({ type: 'error', message: error.message || 'An error occurred' });
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Settings">
            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 scrollbar-hide">

                {/* Appearance */}
                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-white/60 uppercase tracking-wider">Appearance</h4>
                    <div className="bg-white/5 border border-white/5 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <span className="text-white/80">Theme Color</span>
                            <div className="flex gap-2">
                                {themes.map((theme) => (
                                    <button
                                        key={theme.id}
                                        onClick={() => updateSettings({ themeColor: theme.id })}
                                        className={`w-6 h-6 rounded-full ${theme.bg} transition-all ${settings.themeColor === theme.id
                                            ? 'ring-2 ring-white/20 ring-offset-2 ring-offset-black/50 scale-110'
                                            : 'hover:scale-110 opacity-70 hover:opacity-100'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Security */}
                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-white/60 uppercase tracking-wider">Security</h4>
                    <div className="bg-white/5 border border-white/5 rounded-xl overflow-hidden">
                        <button
                            onClick={() => setIsChangingPassword(!isChangingPassword)}
                            className="flex items-center justify-between w-full px-4 py-3 hover:bg-white/5 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <KeyRound size={18} className="text-white/40 group-hover:text-accent transition-colors" />
                                <span className="text-white/80">Change Password</span>
                            </div>
                            <ChevronRight size={18} className={`text-white/20 transition-transform duration-300 ${isChangingPassword ? 'rotate-90' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {isChangingPassword && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="px-4 pb-4"
                                >
                                    <form onSubmit={handlePasswordChange} className="space-y-3 pt-2">
                                        <input
                                            type="password"
                                            placeholder="Current Password"
                                            value={pwdData.current}
                                            onChange={(e) => setPwdData({ ...pwdData, current: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent/50 selection:bg-accent/30"
                                            required
                                        />
                                        <input
                                            type="password"
                                            placeholder="New Password"
                                            value={pwdData.new}
                                            onChange={(e) => setPwdData({ ...pwdData, new: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent/50 selection:bg-accent/30"
                                            required
                                        />
                                        <input
                                            type="password"
                                            placeholder="Confirm New Password"
                                            value={pwdData.confirm}
                                            onChange={(e) => setPwdData({ ...pwdData, confirm: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent/50 selection:bg-accent/30"
                                            required
                                        />

                                        <button
                                            type="submit"
                                            disabled={pwdStatus.type === 'loading'}
                                            className="w-full py-2 bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                                        >
                                            {pwdStatus.type === 'loading' ? (
                                                <Loader2 size={16} className="animate-spin" />
                                            ) : 'Update Password'}
                                        </button>

                                        {pwdStatus.message && (
                                            <div className={`flex items-center gap-2 text-xs mt-2 ${pwdStatus.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                                                {pwdStatus.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                                                {pwdStatus.message}
                                            </div>
                                        )}
                                    </form>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Data & Privacy */}
                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-white/60 uppercase tracking-wider">Data & Privacy</h4>
                    <div className="grid grid-cols-1 gap-2">
                        <button
                            onClick={handleExport}
                            className="flex items-center justify-between w-full px-4 py-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors text-left group"
                        >
                            <div className="flex items-center gap-3">
                                <Download size={18} className="text-white/40 group-hover:text-accent transition-colors" />
                                <span className="text-white/80 group-hover:text-white">Export all entries</span>
                            </div>
                            <span className="text-white/40">JSON</span>
                        </button>
                    </div>
                </div>

                {/* Account Actions */}
                <div className="pt-2 border-t border-white/5">
                    <form action={logout}>
                        <button
                            type="submit"
                            className="w-full py-3 px-4 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all font-medium border border-red-500/10 flex items-center justify-center gap-2 group"
                        >
                            <LogOut size={18} className="text-red-400/60 group-hover:text-red-400 transition-colors" />
                            Sign Out
                        </button>
                    </form>
                </div>

            </div>
        </Modal>
    );
}
