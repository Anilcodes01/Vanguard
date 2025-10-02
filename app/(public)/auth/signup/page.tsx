'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await signIn('credentials', {
        email,
        password,
        mode: 'signup',
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
         router.push('/');
      }
    } catch (err) {
      setError('An unexpected error occurred 😥');
    }
  };

  return (
   <div className='flex items-center justify-center  min-h-screen'>
     <form className='flex flex-col h-full' onSubmit={handleSubmit}>
      <h2 className='text-4xl font-bold mb-4'>Create an Account</h2>
     <div className='flex flex-col gap-4'>
         <input
        type="email"
        className='px-2 py-1 border rounded-xl'
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
         className='px-2 py-1 border rounded-xl'
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
     </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button className='w-fit  mt-4 bg-blue-500 rounded-xl items-center text-center flex px-4 py-1' type="submit">Sign Up</button>
    </form>
   </div>
  );
}