import { createClient } from '@/app/utils/supabase/server';
import {prisma} from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase =await createClient();

  // Get the current user from the session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { domain, college_name, avatar_url } = await request.json();

  // Validate the input
  if (!domain || !college_name) {
    return NextResponse.json(
      { error: 'Domain and College Name are required.' },
      { status: 400 }
    );
  }

  try {
    // Update the user's profile in the public.profiles table
    await prisma.profiles.update({
      where: {
        id: user.id,
      },
      data: {
        domain,
        college_name,
        avatar_url: avatar_url || null, // Set to null if empty
        onboarded: true, // This is the crucial step!
      },
    });

    return NextResponse.json({ message: 'Profile updated successfully.' });
  } catch (error) {
    console.error('Onboarding API Error:', error);
    return NextResponse.json(
      { error: 'An internal error occurred.' },
      { status: 500 }
    );
  }
}