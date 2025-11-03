import { createClient } from "@/app/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  try {
    const profile = await prisma.profiles.findUnique({
      where: { id: user.id },
    });

    if (!profile) {
      return NextResponse.json(
        { message: "Profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(profile);
  } catch (error) {
    console.error("Failed to fetch profile:", error);
    return NextResponse.json(
      { message: "An internal server error occurred" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }

  const formData = await req.formData();
  const avatarFile = formData.get("avatar") as File | null;

  const getArray = (key: string) => formData.getAll(key).map(String);
  const getString = (key: string) => formData.get(key) as string | null;

  const profileData = {
    name: getString("name"),
    username: getString("username"),
    domain: getString("domain"),
    college_name: getString("college_name"),
    year_of_study: getString("year_of_study"),
    primary_field: getString("primary_field"),
    comfort_level: getString("comfort_level"),
    preferred_langs: getArray("preferred_langs"),
  };

  try {
    if (profileData.username) {
      const existingProfile = await prisma.profiles.findUnique({
        where: { username: profileData.username },
      });
      if (existingProfile && existingProfile.id !== user.id) {
        return NextResponse.json(
          { message: "Username is already taken." },
          { status: 409 }
        );
      }
    }

    let avatar_url: string | undefined = undefined;
    if (avatarFile) {
      const fileExtension = avatarFile.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExtension}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, avatarFile, { upsert: true });

      if (uploadError) {
        console.error("Supabase upload error:", uploadError);
        return NextResponse.json(
          { message: "Failed to upload avatar." },
          { status: 500 }
        );
      }

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);
      avatar_url = urlData.publicUrl;
    }

    const updatedProfile = await prisma.profiles.update({
      where: { id: user.id },
      data: {
        ...profileData,
        ...(avatar_url && { avatar_url }),
      },
    });

    return NextResponse.json({
      message: "Profile updated successfully!",
      profile: updatedProfile,
    });
  } catch (error) {
    console.error("Failed to update profile:", error);
    return NextResponse.json(
      { message: "An internal server error occurred" },
      { status: 500 }
    );
  }
}
