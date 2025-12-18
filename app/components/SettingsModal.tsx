'use client';

import Modal from './Modal';
import { logout } from '../auth/actions';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Settings">
            <div className="space-y-6">

                {/* Appearance */}
                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-white/60 uppercase tracking-wider">Appearance</h4>
                    <div className="bg-white/5 border border-white/5 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-white/80">Theme Color</span>
                            <div className="flex gap-2">
                                <button className="w-6 h-6 rounded-full bg-violet-500 ring-2 ring-white/20 ring-offset-2 ring-offset-black/50"></button>
                                <button className="w-6 h-6 rounded-full bg-teal-500 hover:ring-2 ring-white/20 ring-offset-2 ring-offset-black/50 transition-all"></button>
                                <button className="w-6 h-6 rounded-full bg-orange-500 hover:ring-2 ring-white/20 ring-offset-2 ring-offset-black/50 transition-all"></button>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-white/80">Reduced Motion</span>
                            <div className="w-10 h-6 bg-white/10 rounded-full relative cursor-pointer">
                                <div className="absolute left-1 top-1 w-4 h-4 bg-white/40 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Data & Privacy */}
                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-white/60 uppercase tracking-wider">Data & Privacy</h4>
                    <div className="grid grid-cols-1 gap-2">
                        <button className="flex items-center justify-between w-full px-4 py-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors text-left group">
                            <span className="text-white/80 group-hover:text-white">Export all entries</span>
                            <span className="text-white/40">JSON</span>
                        </button>
                        <button className="flex items-center justify-between w-full px-4 py-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-colors text-left group">
                            <span className="text-white/80 group-hover:text-white">Change Password</span>
                            <span className="text-white/40">→</span>
                        </button>
                    </div>
                </div>

                {/* Account Actions */}
                <div className="pt-2 border-t border-white/5">
                    <form action={logout}>
                        <button
                            type="submit"
                            className="w-full py-3 px-4 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all font-medium border border-red-500/10"
                        >
                            Sign Out
                        </button>
                    </form>
                </div>

            </div>
        </Modal>
    );
}
