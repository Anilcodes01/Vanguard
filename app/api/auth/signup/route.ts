import { createClient } from '@/app/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { name, username, email, password } = await request.json();

  if (!email || !password || !name || !username) {
    return NextResponse.json(
      { error: 'All fields are required.' },
      { status: 400 }
    );
  }

  const supabase =await createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        username,
      },
    },
  });

  if (error) {
    console.error('Supabase sign up error:', error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (data.user && !data.user.email_confirmed_at) {
    return NextResponse.json({
      message: 'Sign up successful! Please check your email to confirm your account.',
    });
  }

  return NextResponse.json({ message: 'Sign up successful!' });
}