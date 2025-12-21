'use client';

import { useState, useRef, useEffect } from 'react';
import { addVentWord, clearVentWords } from '../actions';
import Airlock from './Airlock';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Volume2, VolumeX } from 'lucide-react';

interface VentClientProps {
    initialWords: { _id: string; word: string; createdAt: Date }[];
}

export default function VentClient({ initialWords }: VentClientProps) {
    const [words, setWords] = useState(initialWords);
    const [inputValue, setInputValue] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const router = useRouter();
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Initialize and preload audio element for instant playback
        audioRef.current = new Audio('/airlock-sound.mp3');
        audioRef.current.volume = 0.5; // 50% volume
        audioRef.current.preload = 'auto'; // Preload the audio
        audioRef.current.load(); // Start loading immediately

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    const handleAddWord = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isAdding) return;

        setIsAdding(true);
        try {
            const newWord = await addVentWord(inputValue);
            setWords(prev => [newWord, ...prev]);
            setInputValue('');
            toast.success('Word added to the void');
        } catch (error) {
            console.error('Failed to add word:', error);
            toast.error('Failed to add word');
        } finally {
            setIsAdding(false);
        }
    };

    const handleEject = async () => {
        // Play sound effect if not muted
        if (!isMuted && audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(err => {
                console.log('Audio play failed:', err);
            });
        }

        try {
            await clearVentWords();
            setWords([]);
            toast.success('All words ejected into space! 🚀');
            router.refresh();
        } catch (error) {
            console.error('Failed to clear words:', error);
            toast.error('Failed to clear words');
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
            {/* Space Background */}
            <div className="fixed inset-0 z-0 bg-gradient-to-b from-[#0a0514] via-[#1a0b2e] to-[#0d0221]">
                {/* Nebula effects */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-pink-600/15 rounded-full blur-[90px] animate-pulse" style={{ animationDelay: '2s' }} />

                {/* Stars */}
                <div className="stars-container absolute inset-0">
                    {[...Array(50)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-1 h-1 bg-white rounded-full animate-twinkle"
                            style={{
                                top: `${Math.random() * 100}%`,
                                left: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 3}s`,
                                opacity: Math.random() * 0.7 + 0.3
                            }}
                        />
                    ))}
                </div>
            </div>

            <div className="relative z-10 p-6">
                <div className="max-w-6xl mx-auto h-[calc(100vh-3rem)] flex flex-col gap-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                Vent Space
                            </h1>
                            <p className="text-zinc-300/60 mt-2">
                                Type your thoughts and watch them bounce. Release them when you're ready.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Mute/Unmute Button */}
                            <button
                                onClick={() => setIsMuted(!isMuted)}
                                className="p-3 glass rounded-lg hover:bg-zinc-800/50 transition-all group"
                                title={isMuted ? 'Unmute' : 'Mute'}
                            >
                                {isMuted ? (
                                    <VolumeX className="w-5 h-5 text-zinc-400 group-hover:text-zinc-300" />
                                ) : (
                                    <Volume2 className="w-5 h-5 text-accent group-hover:text-accent/80" />
                                )}
                            </button>
                            <button
                                onClick={() => router.back()}
                                className="px-4 py-2 glass rounded-lg hover:bg-zinc-800/50 transition-all"
                            >
                                ← Back
                            </button>
                        </div>
                    </div>

                    {/* Word Input */}
                    <form onSubmit={handleAddWord} className="flex gap-3">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Type a word or thought..."
                            maxLength={50}
                            className="flex-1 px-6 py-3 glass rounded-full border border-zinc-700/50 focus:border-accent/50 focus:outline-none focus:ring-2 focus:ring-accent/20 bg-zinc-900/50 text-foreground placeholder:text-zinc-500 transition-all"
                        />
                        <button
                            type="submit"
                            disabled={!inputValue.trim() || isAdding}
                            className="px-8 py-3 bg-accent/20 hover:bg-accent/30 disabled:bg-zinc-800/20 disabled:text-zinc-600 border border-accent/30 disabled:border-zinc-700/30 rounded-full font-semibold text-accent disabled:cursor-not-allowed transition-all duration-300"
                        >
                            {isAdding ? 'Adding...' : 'Add Word'}
                        </button>
                    </form>

                    {/* Airlock Component */}
                    <Airlock
                        words={words.map(w => w.word)}
                        onEject={handleEject}
                        containerClassName="min-h-[500px]"
                        wordClassName="text-cyan-300 border border-cyan-400/30 shadow-lg shadow-cyan-500/20"
                    />
                </div>
            </div>

            <style jsx>{`
                @keyframes twinkle {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.2); }
                }
                .animate-twinkle {
                    animation: twinkle 3s infinite;
                }
            `}</style>
        </div>
    );
}
