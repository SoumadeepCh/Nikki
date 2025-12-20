'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Trash2, Save, Loader2, Sparkles, Image as ImageIcon, X } from 'lucide-react';
import { uploadImage } from '../utils/cloudinary';

interface DiaryEditorProps {
    date: Date;
    initialContent: string;
    initialColor: string;
    initialImages?: string[];
    onSave: (content: string, color: string, images: string[]) => Promise<void>;
    onDelete: () => Promise<void>;
}

const COLORS = [
    '#ef4444', '#f97316', '#eab308', '#22c55e',
    '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899',
];

export default function DiaryEditor({ date, initialContent, initialColor, initialImages = [], onSave, onDelete }: DiaryEditorProps) {
    const [content, setContent] = useState(initialContent);
    const [selectedColor, setSelectedColor] = useState(initialColor);
    const [images, setImages] = useState<string[]>(initialImages);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [hasContent, setHasContent] = useState(false);
    const [mounted, setMounted] = useState(false);

    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        setContent(initialContent);
        setSelectedColor(initialColor);
        setImages(initialImages);
        setHasContent(!!initialContent || initialImages.length > 0);
    }, [date, initialContent, initialColor, initialImages]);

    const handleSave = async () => {
        if (!content.trim()) {
            toast.error("Can't save an empty entry!");
            return;
        }

        setIsSaving(true);
        try {
            await onSave(content, selectedColor, images);
            toast.success('Entry saved successfully', {
                icon: <Sparkles className="w-4 h-4 text-yellow-400" />,
            });
            setHasContent(true);
        } catch (error) {
            toast.error('Failed to save entry');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this entry? This cannot be undone.')) return;

        setIsDeleting(true);
        try {
            await onDelete();
            setContent('');
            setHasContent(false);
            toast.success('Entry deleted');
        } catch (error) {
            toast.error('Failed to delete entry');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            key={date.toISOString()}
            className="glass w-full h-[600px] flex flex-col rounded-3xl overflow-hidden relative border border-white/5 shadow-2xl"
        >
            {/* Dynamic Background */}
            <div
                className="absolute inset-0 opacity-15 pointer-events-none transition-colors duration-1000 ease-in-out"
                style={{ backgroundColor: selectedColor }}
            />

            {/* Header */}
            <div className="p-8 border-b border-white/5 flex justify-between items-center z-10 bg-white/5 backdrop-blur-md">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white mb-1">
                        {format(date, 'EEEE')}
                    </h2>
                    <p className="text-white/40 font-mono text-sm tracking-wider uppercase">
                        {format(date, 'MMMM do, yyyy')}
                    </p>
                </div>

                <div className="flex gap-3">
                    {hasContent && (
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting || isSaving}
                            className="p-3 rounded-full hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-all disabled:opacity-50"
                            title="Delete Entry"
                        >
                            {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                        </button>
                    )}

                    {mounted && (
                        <div className="relative">
                            <input
                                type="file"
                                id="diary-image-upload"
                                className="hidden"
                                accept="image/*"
                                multiple
                                onChange={async (e) => {
                                    const files = e.target.files;
                                    if (!files || files.length === 0) return;

                                    setIsUploading(true);
                                    let uploadedCount = 0;

                                    try {
                                        for (let i = 0; i < files.length; i++) {
                                            const result = await uploadImage(files[i]);
                                            setImages(prev => [...prev, result.secure_url]);
                                            uploadedCount++;
                                        }
                                        if (uploadedCount > 0) {
                                            toast.success(`${uploadedCount} image${uploadedCount > 1 ? 's' : ''} added!`);
                                        }
                                    } catch (error: any) {
                                        toast.error(error.message || 'Upload failed');
                                    } finally {
                                        setIsUploading(false);
                                        // Reset the input so the same file can be uploaded again if needed
                                        e.target.value = '';
                                    }
                                }}
                            />
                            <button
                                onClick={() => document.getElementById('diary-image-upload')?.click()}
                                disabled={isUploading || isSaving || isDeleting}
                                className="p-3 rounded-full hover:bg-white/10 text-white/40 hover:text-white transition-all disabled:opacity-50"
                                title="Add Image"
                            >
                                {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
                            </button>
                        </div>
                    )}

                    <button
                        onClick={handleSave}
                        disabled={isSaving || isDeleting}
                        className="bg-white text-black hover:bg-gray-200 px-6 py-2.5 rounded-full text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-white/5 disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-95"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {isSaving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>

            {/* Color Palette */}
            <div className="px-8 py-5 flex items-center gap-4 z-10 border-b border-white/5">
                <span className="text-xs font-bold text-white/30 uppercase tracking-widest">Mood</span>
                <div className="flex gap-2">
                    {COLORS.map((color) => (
                        <button
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            className={`
                        w-6 h-6 rounded-full transition-all duration-300 relative
                        ${selectedColor === color ? 'scale-125 shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'hover:scale-110 opacity-60 hover:opacity-100'}
                      `}
                            style={{ backgroundColor: color }}
                        >
                            {selectedColor === color && (
                                <motion.div
                                    layoutId="active-ring"
                                    className="absolute -inset-1 border border-white rounded-full"
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Editor & Images Container */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
                <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="What's on your mind today?"
                    className="flex-1 w-full bg-transparent resize-none p-8 text-xl outline-none text-white/90 placeholder:text-white/10 z-10 font-sans leading-relaxed selection:bg-white/20"
                    spellCheck={false}
                />

                {/* Polaroid Images Sidebar/Container */}
                <AnimatePresence>
                    {images.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, width: 0 }}
                            animate={{ opacity: 1, width: 'auto' }}
                            exit={{ opacity: 0, width: 0 }}
                            className="p-8 flex flex-col gap-6 overflow-y-auto max-w-[300px] z-10 border-l border-white/5 bg-white/5"
                        >
                            {images.map((url, idx) => (
                                <motion.div
                                    key={url}
                                    initial={{ opacity: 0, scale: 0.8, rotate: idx % 2 === 0 ? -2 : 2 }}
                                    animate={{ opacity: 1, scale: 1, rotate: idx % 2 === 0 ? -2 : 2 }}
                                    whileHover={{ scale: 1.05, rotate: 0 }}
                                    className="polaroid relative bg-white p-2 pb-8 shadow-xl"
                                >
                                    <button
                                        onClick={() => setImages(prev => prev.filter(img => img !== url))}
                                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity z-20"
                                    >
                                        <X size={14} />
                                    </button>

                                    {/* Push Pin */}
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-red-600 shadow-md z-20">
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-red-400 opacity-50"></div>
                                    </div>

                                    <div className="w-full aspect-square overflow-hidden bg-neutral-100">
                                        <img src={url} alt={`Diary log ${idx + 1}`} className="w-full h-full object-cover" />
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer info */}
            <div className="absolute bottom-4 right-6 pointer-events-none text-xs text-white/10 font-mono z-10">
                {content.length} characters
            </div>
        </motion.div>
    );
}
