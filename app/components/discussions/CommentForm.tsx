"use client";

import { useState, FormEvent } from "react";
import { Loader2, Send } from "lucide-react";
import { Comment } from "@/types";

interface CommentFormProps {
  projectId: string;
  parentId?: string;
  onCommentSubmitted: (newComment: Comment) => void;
  placeholderText?: string;
}

export default function CommentForm({
  projectId,
  parentId,
  onCommentSubmitted,
  placeholderText,
}: CommentFormProps) {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/discussions/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submittedProjectId: projectId,
          text,
          parentId,
        }),
      });
      const newComment = await response.json();
      if (response.ok) {
        onCommentSubmitted(newComment);
        setText("");
      } else {
        console.error("Failed to post comment:", newComment);
      }
    } catch (error) {
      console.error("Failed to post comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex items-center gap-3">
      <div className="relative w-full">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholderText || "Add a comment..."}
          className="block w-full rounded-full border-0 bg-neutral-800 py-2.5 pl-4 pr-4 text-white placeholder:text-neutral-500 focus:ring-2 focus:ring-inset focus:ring-green-500 transition-shadow"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !text.trim()}
        className="flex-shrink-0 p-2.5 rounded-full bg-green-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-neutral-900"
      >
        {isSubmitting ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Send className="w-5 h-5" />
        )}
      </button>
    </form>
  );
}