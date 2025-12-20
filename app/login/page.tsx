'use client';

import { login } from '@/app/auth/actions';
import { useActionState } from 'react';
import Link from 'next/link';
import { useFormStatus } from 'react-dom';
import Background from '../components/Background';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full bg-accent text-white rounded-lg px-4 py-2 hover:bg-accent/90 transition-all shadow-[0_0_15px_rgba(var(--accent-rgb),0.3)] hover:shadow-[0_0_25px_rgba(var(--accent-rgb),0.5)] disabled:opacity-50 font-medium"
        >
            {pending ? 'Logging in...' : 'Login'}
        </button>
    );
}

const initialState = {
    error: '',
};

export default function LoginPage() {
    const [state, formAction] = useActionState(login, initialState);

    return (
        <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
            <Background />

            <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
                <h2 className="mt-6 text-center text-4xl font-bold tracking-tight text-white mb-2">
                    Welcome back
                </h2>
                <p className="text-center text-white/40 text-sm">
                    Enter your credentials to access your diary
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
                <div className="glass py-8 px-4 sm:rounded-2xl sm:px-10 border border-white/5 bg-white/5 backdrop-blur-xl shadow-2xl">
                    <form action={formAction} className="space-y-6">
                        {state?.error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-200 rounded-lg p-3 text-sm text-center">
                                {state.error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-white/70">
                                Email address
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    className="appearance-none block w-full px-3 py-2 border border-white/10 rounded-lg bg-black/20 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent sm:text-sm transition-all text-center"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-white/70">
                                Password
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    className="appearance-none block w-full px-3 py-2 border border-white/10 rounded-lg bg-black/20 text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent sm:text-sm transition-all text-center"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div>
                            <SubmitButton />
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-transparent text-white/40 glass-text-bg">
                                    New to Nikki?
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 text-center">
                            <Link
                                href="/register"
                                className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
                            >
                                Create a new account
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
