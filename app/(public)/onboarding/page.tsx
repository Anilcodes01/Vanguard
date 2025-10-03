'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const [domain, setDomain] = useState('');
  const [collegeName, setCollegeName] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('domain', domain);
    formData.append('college_name', collegeName);
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

    const response = await fetch('/api/onboarding', {
      method: 'POST',
      body: formData,
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
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:border-indigo-500 focus:ring focus:ring-indigo-200"
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
              className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 focus:border-indigo-500 focus:ring focus:ring-indigo-200"
            />
          </div>

          <div>
            <label htmlFor="avatar" className="block text-sm font-medium text-gray-600">
              Avatar <span className="text-gray-400">(Optional)</span>
            </label>
            <input
              id="avatar"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="mt-1 w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-indigo-600 hover:file:bg-indigo-100"
            />
          </div>

          {avatarPreview && (
            <div className="mt-4 flex justify-center">
              <img
                src={avatarPreview}
                alt="Avatar Preview"
                className="h-24 w-24 rounded-full object-cover"
              />
            </div>
          )}

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