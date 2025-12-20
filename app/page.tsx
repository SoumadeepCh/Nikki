
import Link from 'next/link';
import connectDB from '@/lib/db';
import User from '@/models/User';
import ClientPage from './components/ClientPage';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUserStats } from './actions';

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;
  const session = token ? await verifyToken(token) : null;

  if (!session) {
    // Guest Mode
    return (
      <div className="relative">
        <ClientPage userName="Guest" userEmail="" stats={{ totalEntries: 0, streak: 0, frequentMood: '#8b5cf6' }} isGuest={true} />
      </div>
    );
  }

  // Fetch full user details to get the name
  // Note: we need to handle the case where user might be deleted but session exists
  await connectDB();
  const user = await User.findById(session.userId);

  if (!user) {
    // Session invalid if user doesn't exist
    redirect('/login');
  }

  const stats = await getUserStats();

  // Prepare settings with defaults if undefined
  const userSettings = {
    themeColor: user.settings?.themeColor || 'violet',
    reducedMotion: user.settings?.reducedMotion || false
  };

  return (
    <div className="relative">
      <ClientPage
        userName={user.name}
        userEmail={user.email}
        profileImage={user.profileImage}
        stats={stats}
        isGuest={false}
        initialSettings={userSettings}
      />
    </div>
  );
}
