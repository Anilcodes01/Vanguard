"use client";

import { Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteButton({ journalId }: { journalId: string }) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm("Are you sure you want to delete this journal?");
    if (!confirmed) return;

    setIsDeleting(true);

    try {
      const res = await fetch(`/api/journal/${journalId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        router.push("/journal");
        router.refresh();
      } else {
        alert("Failed to delete journal.");
        setIsDeleting(false);
      }
    } catch (error) {
      console.error(error);
      alert("Error deleting journal.");
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
      title="Delete Journal"
    >
      <Trash className="w-4 h-4" />
    </button>
  );
}