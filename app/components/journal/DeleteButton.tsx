'use client';

import { deleteNoteAction } from "@/app/actions/notes";
import { Trash2 } from "lucide-react";
import { useTransition } from "react";
import toast from "react-hot-toast";

export default function DeleteNoteButton({ noteId }: { noteId: string }) {
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    if (confirm("Are you sure you want to delete this note? This action cannot be undone.")) {
      startTransition(async () => {
        try {
          await deleteNoteAction(noteId);
          toast.success("Note deleted successfully.");
        } catch (error) {
          toast.error(error instanceof Error ? error.message : "Failed to delete note.");
        }
      });
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="bg-red-50 text-red-600 gap-2 flex px-4 py-2 justify-center items-center hover:bg-red-100 transition-all shadow-sm cursor-pointer rounded-lg font-medium text-sm disabled:opacity-50"
    >
      <Trash2 className="w-4 h-4" />
      {isPending ? "Deleting..." : "Delete"}
    </button>
  );
}