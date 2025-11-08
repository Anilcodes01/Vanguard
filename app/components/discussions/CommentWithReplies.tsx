"use client";

import { useState } from "react";
import Image from "next/image";
import { CornerDownRight } from "lucide-react";
import { Comment } from "@/types";
import CommentForm from "./CommentForm";

interface CommentWithRepliesProps {
  comment: Comment;
  projectId: string;
  onNewComment: (projectId: string, newComment: Comment) => void;
}

export default function CommentWithReplies({
  comment,
  projectId,
  onNewComment,
}: CommentWithRepliesProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const userProfile = comment.user.profiles?.[0];

  return (
    <div className="flex items-start gap-3">
      <Image
        src={userProfile?.avatar_url || "/default-avatar.png"}
        alt={userProfile?.name || "User avatar"}
        width={32}
        height={32}
        className="rounded-full mt-0.5 h-8 w-8 object-cover flex-shrink-0"
      />
      <div className="flex-1">
        <div className="bg-neutral-800 rounded-lg p-3">
          <p className="text-sm font-semibold text-white">
            {userProfile?.name || userProfile?.username || "Anonymous"}
          </p>
          <p className="text-sm text-neutral-300 mt-0.5 whitespace-pre-wrap">{comment.text}</p>
        </div>
        <button
          onClick={() => setShowReplyForm(!showReplyForm)}
          className="text-xs text-neutral-400 hover:text-white mt-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded"
        >
          <CornerDownRight className="w-3 h-3" />
          <span>Reply</span>
        </button>

        <div className="mt-3 space-y-3">
          {showReplyForm && (
            <CommentForm
              projectId={projectId}
              parentId={comment.id}
              placeholderText="Write a reply..."
              onCommentSubmitted={(newComment) => {
                onNewComment(projectId, newComment);
                setShowReplyForm(false);
              }}
            />
          )}
          {comment.replies?.map((reply) => (
            <CommentWithReplies
              key={reply.id}
              comment={reply}
              projectId={projectId}
              onNewComment={onNewComment}
            />
          ))}
        </div>
      </div>
    </div>
  );
}