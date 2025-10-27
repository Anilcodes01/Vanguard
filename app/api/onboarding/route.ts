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
  const avatarFile = formData.get('avatar') as File | null;

  const getArray = (key: string) => formData.getAll(key).map(String);
  const getString = (key: string) => formData.get(key) as string | null;

  const data = {
    domain: getString('domain'),
    name: getString('name'),
    college_name: getString('college_name'),
    year_of_study: getString('year_of_study'),
    primary_field: getString('primary_field'),
    comfort_level: getString('comfort_level'),
    preferred_langs: getArray('preferred_langs'),
    platform_exp: getString('platform_exp'),
    main_goal: getArray('main_goal'),
    challenge_pref: getArray('challenge_pref'),
    motivation: getArray('motivation'),
    time_dedication: getString('time_dedication'),
    internship_interest: getString('internship_interest'),
    role_interest: getArray('role_interest'),
    project_pref: getString('project_pref'),
    playstyle: getString('playstyle'),
    first_badge: getString('first_badge'),
  };

  if (!data.name || !data.domain) {
    return NextResponse.json(
      { error: 'Name and Domain are required.' },
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
      .upload(filePath, avatarFile, { upsert: true });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload avatar.' }, { status: 500 });
    }

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
    avatar_url = urlData.publicUrl;
  }

  try {
    const updateData = {
      ...data,
      onboarded: true,
      ...(avatar_url && { avatar_url }),
    };

    await prisma.profiles.update({
      where: { id: user.id },
      data: updateData,
    });

    return NextResponse.json({ message: 'Profile updated successfully.' });
  } catch (error) {
    console.error('Onboarding API Error:', error);
    return NextResponse.json({ error: 'An internal error occurred.' }, { status: 500 });
  }
}