'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || 'Failed to log in.');
    } else {
      router.push('/');
      router.refresh(); 
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#262626] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
          <p className="mt-2 text-gray-400">Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="peer w-full rounded-md border border-gray-600 bg-transparent px-4 py-2 text-white placeholder-transparent focus:border-indigo-500 focus:outline-none"
              placeholder="Email"
            />
            <label
              htmlFor="email"
              className="absolute -top-3.5 left-3 bg-[#262626] px-1 text-sm text-gray-400 transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-indigo-500"
            >
              Email
            </label>
          </div>

          <div className="relative">
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="peer w-full rounded-md border border-gray-600 bg-transparent px-4 py-2 text-white placeholder-transparent focus:border-indigo-500 focus:outline-none"
              placeholder="Password"
            />
            <label
              htmlFor="password"
              className="absolute -top-3.5 left-3 bg-[#262626] px-1 text-sm text-gray-400 transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-indigo-500"
            >
              Password
            </label>
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-indigo-600 py-2.5 font-semibold text-white transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#262626]"
          >
            Login
          </button>
        </form>

        {error && (
          <p className="mt-4 text-center text-sm text-red-400">{error}</p>
        )}

        <p className="mt-8 text-center text-sm text-gray-400">
          Don’t have an account?{' '}
          <a href="/signup" className="font-medium text-indigo-500 hover:underline">
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}