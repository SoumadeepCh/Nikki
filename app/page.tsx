import ClientPage from './components/ClientPage';
import { verifyToken } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { logout } from './auth/actions';
import { cookies } from 'next/headers';

export default async function Home() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;
  const session = token ? await verifyToken(token) : null;

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-50">
        <form action={logout}>
          <button
            type="submit"
            className="text-sm font-medium text-gray-500 hover:text-red-600 transition-colors bg-white/50 px-3 py-1 rounded-md backdrop-blur-sm"
          >
            Sign out
          </button>
        </form>
      </div>
      <ClientPage />
    </div>
  );
}
