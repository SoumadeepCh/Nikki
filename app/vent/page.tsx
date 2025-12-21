import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '@/lib/auth';
import { getVentWords } from '../actions';
import VentClient from '../components/VentClient';

export default async function VentPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('session_token')?.value;
    const session = token ? await verifyToken(token) : null;

    if (!session) {
        redirect('/login');
    }

    const words = await getVentWords();

    return <VentClient initialWords={words} />;
}
