'use client';

import { useState, useEffect } from 'react';
import Calendar from './Calendar';
import DiaryEditor from './DiaryEditor';
import { getMonthEntries, getEntryByDate, saveEntry, deleteEntry } from '../actions';
import { Toaster } from 'sonner';

export default function ClientPage() {
  const [currentDate, setCurrentDate] = useState(new Date()); 
  const [selectedDate, setSelectedDate] = useState(new Date()); 
  
  const [entries, setEntries] = useState<{ date: string | Date; moodColor: string }[]>([]);
  const [editorContent, setEditorContent] = useState('');
  const [editorColor, setEditorColor] = useState('#8b5cf6');

  // Fetch entries for the calendar month
  const fetchMonthEntries = async () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const data = await getMonthEntries(year, month);
    setEntries(data);
  };

  useEffect(() => {
    fetchMonthEntries();
  }, [currentDate]);

  // Fetch specific entry when selected date changes
  useEffect(() => {
    const fetchSpecificEntry = async () => {
      const data = await getEntryByDate(selectedDate.toISOString());
      if (data) {
        setEditorContent(data.content);
        setEditorColor(data.moodColor);
      } else {
        setEditorContent('');
        setEditorColor('#8b5cf6'); // Default
      }
    };
    fetchSpecificEntry();
  }, [selectedDate]);

  const handleSave = async (content: string, color: string) => {
      const saved = await saveEntry(selectedDate.toISOString(), content, color);
      
      // Optimistic or Real-time update of local entries
      setEntries(prev => {
        const filtered = prev.filter(e => new Date(e.date).toDateString() !== new Date(saved.date).toDateString());
        return [...filtered, { date: saved.date, moodColor: saved.moodColor }];
      });
      
      setEditorContent(saved.content);
      setEditorColor(saved.moodColor);
  };

  const handleDelete = async () => {
      await deleteEntry(selectedDate.toISOString());
      
      // Update calendar state
      setEntries(prev => prev.filter(e => new Date(e.date).toDateString() !== selectedDate.toDateString()));
      
      // Reset editor
      setEditorContent('');
      setEditorColor('#8b5cf6');
  };

  return (
    <main className="min-h-screen p-8 lg:p-12 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/20 blur-[130px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-pink-600/20 blur-[130px]" />
      </div>

      <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-16 items-start z-10">
        
        {/* Left Col: Calendar & Info */}
        <div className="flex flex-col gap-10 sticky top-10">
           <div className="space-y-4">
             <h1 className="text-7xl font-bold tracking-tighter text-white">
               Nikki.
             </h1>
             <p className="text-white/40 text-lg font-light max-w-md leading-relaxed">
                Capture the essence of your days. A digital sanctuary for your thoughts, moods, and memories.
             </p>
           </div>
           
           <Calendar 
             currentDate={currentDate}
             onDateSelect={(date) => {
               setSelectedDate(date);
               setCurrentDate(date);
             }}
             entries={entries}
             selectedDate={selectedDate}
           />
        </div>

        {/* Right Col: Editor */}
        <div className="w-full pt-10 md:pt-0">
            <DiaryEditor 
              date={selectedDate}
              initialContent={editorContent}
              initialColor={editorColor}
              onSave={handleSave}
              onDelete={handleDelete}
            />
        </div>
      </div>
      
      <Toaster theme="dark" position="bottom-right" />
    </main>
  );
}
