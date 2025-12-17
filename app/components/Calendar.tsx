'use client';

import { useState } from 'react';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface CalendarProps {
    currentDate: Date;
    onDateSelect: (date: Date) => void;
    entries: { date: string | Date; moodColor: string }[];
    selectedDate: Date | null;
}

export default function Calendar({ currentDate, onDateSelect, entries, selectedDate }: CalendarProps) {
    const [viewDate, setViewDate] = useState(currentDate);

    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(viewDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const getEntryColor = (day: Date) => {
        const entry = entries.find(e => isSameDay(new Date(e.date), day));
        return entry ? entry.moodColor : null;
    };

    const nextMonth = () => setViewDate(addMonths(viewDate, 1));
    const prevMonth = () => setViewDate(subMonths(viewDate, 1));

    return (
        <div className="glass p-6 rounded-2xl w-full max-w-md mx-auto">
            <div className="flex justify-between items-center mb-6 text-white">
                <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    ←
                </button>
                <h2 className="text-xl font-bold font-mono">
                    {format(viewDate, 'MMMM yyyy')}
                </h2>
                <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    →
                </button>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-2 text-center text-sm text-gray-400 font-mono">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                    <div key={d}>{d}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
                <AnimatePresence mode='popLayout'>
                    {days.map((day) => {
                        // Alignment for first day
                        const colStart = day.getDate() === 1 ? day.getDay() + 1 : undefined;
                        const color = getEntryColor(day);
                        const isSelected = selectedDate && isSameDay(day, selectedDate);
                        const isToday = isSameDay(day, new Date());

                        return (
                            <motion.button
                                key={day.toISOString()}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                onClick={() => onDateSelect(day)}
                                style={{ gridColumnStart: colStart }}
                                className={`
                   aspect-square rounded-full flex items-center justify-center relative group
                   transition-all duration-300
                   ${!isSameMonth(day, viewDate) ? 'text-gray-600' : 'text-gray-200'}
                 `}
                            >
                                {/* Selection ring */}
                                {isSelected && (
                                    <div className="absolute inset-0 border-2 border-white rounded-full" />
                                )}

                                {/* Today indicator */}
                                {isToday && !isSelected && (
                                    <div className="absolute inset-0 border border-white/30 rounded-full" />
                                )}

                                {/* Content */}
                                <span className="z-10 relative text-sm">{format(day, 'd')}</span>

                                {/* Mood Background */}
                                {color && (
                                    <div
                                        className="absolute inset-0 rounded-full opacity-40 blur-sm z-0"
                                        style={{ backgroundColor: color }}
                                    />
                                )}
                                {color && (
                                    <div
                                        className="absolute inset-0 rounded-full opacity-20 z-0"
                                        style={{ backgroundColor: color }}
                                    />
                                )}
                            </motion.button>
                        );
                    })}
                </AnimatePresence>
            </div>
        </div>
    );
}
