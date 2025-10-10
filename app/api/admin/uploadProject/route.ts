import { createClient } from "@/app/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client"; 

export async function POST(request: Request) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = user.email === 'anilcodes01@gmail.com';
  if (!isAdmin) {
    return NextResponse.json({ error: "Forbidden: Not an admin" }, { status: 403 });
  }

  const formData = await request.formData();
  const name = formData.get('name') as string;
  const domain = formData.get('domain') as string;
  const maxTime = formData.get('maxTime') as string;
  const description = formData.get('description') as string;
  const coverImageFile = formData.get('coverImage') as File | null;

  if (!name || !domain || !maxTime || !description || !coverImageFile) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  
  const fileExtension = coverImageFile.name.split('.').pop();
  const fileName = `${user.id}-${Date.now()}.${fileExtension}`;
  const filePath = `public/${fileName}`; 

  const { error: uploadError } = await supabase.storage
    .from('Projectcoverimages')
    .upload(filePath, coverImageFile);

  if (uploadError) {
    console.error('Supabase upload error:', uploadError);
    return NextResponse.json({ error: "Failed to upload cover image." }, { status: 500 });
  }

  const { data: { publicUrl } } = supabase.storage
    .from('Projectcoverimages')
    .getPublicUrl(filePath);

  if (!publicUrl) {
    return NextResponse.json({ error: "Could not get public URL for the image." }, { status: 500 });
  }

  try {
    const newProject = await prisma.project.create({
      data: {
        name,
        domain,
        maxTime,
        description,
        coverImage: publicUrl, 
      },
    });
    
    return NextResponse.json({ 
        message: "Project created successfully!",
        project: newProject 
    }, { status: 201 });

  } catch (error) { 
    console.error("Prisma create error:", error);
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        const target = error.meta?.target;
        if (Array.isArray(target) && target.includes('name')) {
          return NextResponse.json({ error: "A project with this name already exists." }, { status: 409 });
        }
      }
    }
    
    return NextResponse.json({ error: "Database error." }, { status: 500 });
  }
}