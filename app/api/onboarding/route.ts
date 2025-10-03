import { createClient } from '@/app/utils/supabase/server';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const domain = formData.get('domain') as string;
  const college_name = formData.get('college_name') as string;
  const avatarFile = formData.get('avatar') as File | null;

  if (!domain || !college_name) {
    return NextResponse.json(
      { error: 'Domain and College Name are required.' },
      { status: 400 }
    );
  }

  let avatar_url: string | null = null;
  if (avatarFile) {
    const fileExtension = avatarFile.name.split('.').pop();
    const fileName = `${user.id}.${fileExtension}`; 
    const filePath = `${user.id}/${fileName}`; 

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, avatarFile, {
        upsert: true, 
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload avatar.' },
        { status: 500 }
      );
    }

    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);
    
    avatar_url = urlData.publicUrl;
  }

  try {
    await prisma.profiles.update({
      where: { id: user.id },
      data: {
        domain,
        college_name,
        avatar_url,
        onboarded: true,
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