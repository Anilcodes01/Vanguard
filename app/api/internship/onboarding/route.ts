import { createClient } from "@/app/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const avatarFile = formData.get("avatar") as File | null;

  const getArray = (key: string) => formData.getAll(key).map(String);
  const getString = (key: string) => formData.get(key) as string | null;

  const data = {
    domain: getString("domain"),
    name: getString("name"),
    primary_field: getString("primary_field"),
    comfort_level: getString("comfort_level"),
    preferred_langs: getArray("preferred_langs"),
    main_goal: getArray("main_goal"),
    internship_interest: getString("internship_interest"),
    role_interest: getArray("role_interest"),
    project_pref: getString("project_pref"),
  };

  if (!data.name || !data.domain) {
    return NextResponse.json(
      { error: "Name and Domain are required fields." },
      { status: 400 }
    );
  }

  let avatar_url: string | null = null;
  if (avatarFile) {
    const fileExtension = avatarFile.name.split(".").pop();
    const fileName = `${user.id}-${new Date().getTime()}.${fileExtension}`;
    const filePath = `${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, avatarFile, { upsert: true });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload avatar." },
        { status: 500 }
      );
    }

    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);
    avatar_url = urlData.publicUrl;
  }

  try {
    const updateData = {
      ...data,
      onboarded: true,
      internship_enrolled: true,
      ...(avatar_url && { avatar_url }),
    };

     console.log("ATTEMPTING TO UPDATE PROFILE WITH:", updateData);

    await prisma.profiles.update({
      where: { id: user.id },
      data: updateData,
    });

    return NextResponse.json({
      message: "Profile updated and internship enrolled successfully.",
    });
  } catch (error) {
    console.error("Internship Onboarding API Error:", error);
    return NextResponse.json(
      { error: "An internal error occurred while updating the profile." },
      { status: 500 }
    );
  }
}
