'use server';

import User from '@/models/User';
import connectDB from '@/lib/db';
import { signToken } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

async function setSession(userId: string) {
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const token = await signToken({ userId });

    const cookieStore = await cookies();

    cookieStore.set('session_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expires,
        sameSite: 'lax',
        path: '/',
    });
}

async function clearSession() {
    const cookieStore = await cookies();
    cookieStore.delete('session_token');
}

export async function register(prevState: any, formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!name || !email || !password) {
        return { error: 'All fields are required' };
    }

    try {
        await connectDB();

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return { error: 'Email already exists' };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        await setSession(newUser._id.toString());
    } catch (error) {
        console.error('Registration failed:', error);
        return { error: 'Registration failed' };
    }

    redirect('/');
}

export async function login(prevState: any, formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
        return { error: 'All fields are required' };
    }

    try {
        await connectDB();

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return { error: 'Invalid credentials' };
        }

        const isMatch = await bcrypt.compare(password, user.password as string);
        if (!isMatch) {
            return { error: 'Invalid credentials' };
        }

        // Use _id because User model creates _id by default
        await setSession(user._id.toString());
    } catch (error) {
        console.error('Login failed:', error);
        return { error: 'Login failed' };
    }

    redirect('/');
}

export async function logout() {
    await clearSession();
    redirect('/login');
}
