'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, username, email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || 'Something went wrong.');
    } else {
      setMessage(data.message);
      setTimeout(() => router.push('/onboarding'), 2000);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-white px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">
          Create an Account
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-600">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:border-indigo-500 focus:ring focus:ring-indigo-200"
            />
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-600">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:border-indigo-500 focus:ring focus:ring-indigo-200"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-600">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:border-indigo-500 focus:ring focus:ring-indigo-200"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-600">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:border-indigo-500 focus:ring focus:ring-indigo-200"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-indigo-600 py-2 font-medium text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            Sign Up
          </button>
        </form>

        {error && <p className="mt-4 text-center text-sm text-red-500">{error}</p>}
        {message && <p className="mt-4 text-center text-sm text-green-600">{message}</p>}

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <a href="/login" className="text-indigo-600 hover:underline">
            Log In
          </a>
        </p>
      </div>
    </div>
  );
}
