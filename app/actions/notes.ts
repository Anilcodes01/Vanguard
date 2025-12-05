'use server';

import { createClient } from "@/app/utils/supabase/server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function deleteNoteAction(noteId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be logged in to delete a note.");
  }

  const note = await prisma.note.findUnique({
    where: { id: noteId },
    select: { userId: true },
  });

  if (!note) {
    throw new Error("Note not found.");
  }

  if (note.userId !== user.id) {
    throw new Error("You are not authorized to delete this note.");
  }

  await prisma.note.delete({
    where: { id: noteId },
  });

  revalidatePath('/journal');
  redirect('/journal');
}