'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const [domain, setDomain] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const response = await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        domain,
        college_name: collegeName,
        avatar_url: avatarUrl,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || 'Failed to update profile.');
      setIsSubmitting(false);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 to-white px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="mb-2 text-center text-2xl font-bold text-gray-800">
          Complete Your Profile
        </h1>
        <p className="mb-6 text-center text-gray-600">
          Please fill in your details to continue.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="domain" className="block text-sm font-medium text-gray-600">
              Domain (e.g., Web Development)
            </label>
            <input
              id="domain"
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 placeholder-gray-400 focus:border-indigo-500 focus:ring focus:ring-indigo-200"
            />
          </div>

          <div>
            <label htmlFor="collegeName" className="block text-sm font-medium text-gray-600">
              College Name
            </label>
            <input
              id="collegeName"
              type="text"
              value={collegeName}
              onChange={(e) => setCollegeName(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 placeholder-gray-400 focus:border-indigo-500 focus:ring focus:ring-indigo-200"
            />
          </div>

          <div>
            <label htmlFor="avatarUrl" className="block text-sm font-medium text-gray-600">
              Avatar URL <span className="text-gray-400">(Optional)</span>
            </label>
            <input
              id="avatarUrl"
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://your-avatar-link.com"
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 placeholder-gray-400 focus:border-indigo-500 focus:ring focus:ring-indigo-200"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-indigo-600 py-2 font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Saving...' : 'Save and Continue'}
          </button>
        </form>

        {error && <p className="mt-4 text-center text-sm text-red-500">{error}</p>}
      </div>
    </div>
  );
}
