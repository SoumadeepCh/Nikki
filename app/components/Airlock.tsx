'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Word {
    id: string;
    text: string;
    x: number;
    y: number;
    vx: number;
    vy: number;
    ejecting?: boolean;
    ejectVx?: number;
    ejectVy?: number;
}

interface AirlockProps {
    words: string[];
    onEject: () => void;
    containerClassName?: string;
    wordClassName?: string;
}

export default function Airlock({ words, onEject, containerClassName = '', wordClassName = '' }: AirlockProps) {
    const [bouncingWords, setBouncingWords] = useState<Word[]>([]);
    const [isEjecting, setIsEjecting] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const animationFrameRef = useRef<number | undefined>(undefined);

    // Initialize words with random positions and velocities
    useEffect(() => {
        if (!containerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const newWords: Word[] = words.map((word, index) => ({
            id: `word-${index}-${word}`,
            text: word,
            x: Math.random() * (containerRect.width - 100),
            y: Math.random() * (containerRect.height - 50),
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3,
        }));

        setBouncingWords(newWords);
    }, [words]);

    // Bouncing physics animation
    useEffect(() => {
        if (!containerRef.current || bouncingWords.length === 0) return;

        const animate = () => {
            if (!containerRef.current) return;

            const containerRect = containerRef.current.getBoundingClientRect();

            setBouncingWords(prevWords =>
                prevWords.map(word => {
                    let { x, y, vx, vy, ejecting, ejectVx, ejectVy } = word;

                    if (ejecting && ejectVx !== undefined && ejectVy !== undefined) {
                        // Ejection animation - accelerate outward
                        x += ejectVx;
                        y += ejectVy;
                        ejectVx *= 1.1; // Accelerate
                        ejectVy *= 1.1;
                        return { ...word, x, y, ejectVx, ejectVy };
                    }

                    // Normal bouncing physics
                    x += vx;
                    y += vy;

                    // Bounce off walls
                    const wordWidth = 100; // Approximate word width
                    const wordHeight = 40; // Approximate word height

                    if (x <= 0 || x >= containerRect.width - wordWidth) {
                        vx *= -0.95; // Bounce with slight energy loss
                        x = Math.max(0, Math.min(x, containerRect.width - wordWidth));
                    }

                    if (y <= 0 || y >= containerRect.height - wordHeight) {
                        vy *= -0.95;
                        y = Math.max(0, Math.min(y, containerRect.height - wordHeight));
                    }

                    return { ...word, x, y, vx, vy };
                })
            );

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        animationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [bouncingWords.length]);

    const handleAirlock = () => {
        if (isEjecting) return;

        setIsEjecting(true);

        // Add ejection velocities to all words
        setBouncingWords(prevWords =>
            prevWords.map(word => {
                const angle = Math.random() * Math.PI * 2;
                const speed = 5 + Math.random() * 5;
                return {
                    ...word,
                    ejecting: true,
                    ejectVx: Math.cos(angle) * speed,
                    ejectVy: Math.sin(angle) * speed,
                };
            })
        );

        // Call onEject callback after animation completes
        setTimeout(() => {
            setBouncingWords([]);
            setIsEjecting(false);
            onEject();
        }, 2500);
    };

    return (
        <div className="flex flex-col items-center gap-6 w-full h-full">
            {/* Bouncing Container */}
            <div
                ref={containerRef}
                className={`relative flex-1 w-full glass rounded-2xl overflow-hidden ${containerClassName}`}
            >
                <AnimatePresence>
                    {bouncingWords.map(word => (
                        <motion.div
                            key={word.id}
                            className={`absolute px-4 py-2 rounded-lg glass font-medium ${wordClassName}`}
                            style={{
                                left: word.x,
                                top: word.y,
                            }}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{
                                opacity: word.ejecting ? 0 : 1,
                                scale: word.ejecting ? 0.5 : 1,
                            }}
                            exit={{ opacity: 0, scale: 0 }}
                            transition={{ duration: word.ejecting ? 2 : 0.3 }}
                        >
                            {word.text}
                        </motion.div>
                    ))}
                </AnimatePresence>

                {bouncingWords.length === 0 && !isEjecting && (
                    <div className="absolute inset-0 flex items-center justify-center text-zinc-500">
                        <p className="text-lg">Add words to see them bounce around...</p>
                    </div>
                )}
            </div>

            {/* Airlock Button */}
            <button
                onClick={handleAirlock}
                disabled={bouncingWords.length === 0 || isEjecting}
                className="px-8 py-3 bg-red-600/20 hover:bg-red-600/30 disabled:bg-zinc-800/20 disabled:text-zinc-600 border border-red-500/30 disabled:border-zinc-700/30 rounded-full font-semibold text-red-400 disabled:cursor-not-allowed transition-all duration-300"
            >
                {isEjecting ? 'Ejecting...' : '🚀 Open Airlock'}
            </button>
        </div>
    );
}
