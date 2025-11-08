"use client";

import { ProjectSubmission, Comment } from "@/types";
import CommentForm from "./CommentForm";
import CommentWithReplies from "./CommentWithReplies";

interface CommentSectionProps {
  project: ProjectSubmission;
  onNewComment: (projectId: string, newComment: Comment) => void;
}

export default function CommentSection({
  project,
  onNewComment,
}: CommentSectionProps) {
  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold text-white mb-6">
        Discussion ({project.commentsCount})
      </h3>

      <div className="mb-8">
        <CommentForm
          projectId={project.id}
          onCommentSubmitted={(newComment) =>
            onNewComment(project.id, newComment)
          }
        />
      </div>

      <div className="space-y-6">
        {project.comments
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) 
          .map((comment) => (
            <CommentWithReplies
              key={comment.id}
              comment={comment}
              projectId={project.id}
              onNewComment={onNewComment}
            />
        ))}
      </div>
    </div>
  );
}