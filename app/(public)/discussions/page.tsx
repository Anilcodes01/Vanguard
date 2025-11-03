"use client";

import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { ProjectSubmission, Comment } from "@/types";
import ProjectCard from "@/app/components/discussions/DiscussionsProjectCard";

export default function DiscussionsPage() {
  const [projects, setProjects] = useState<ProjectSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("/api/discussions/projects");
        if (!response.ok) throw new Error("Failed to fetch projects.");
        const data = await response.json();
        setProjects(data);
      } catch (err) {
        if (err instanceof Error) setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const handleUpvote = async (projectId: string) => {
    setProjects((prevProjects) =>
      prevProjects.map((p) => {
        if (p.id === projectId) {
          const newUpvoteCount = p.hasUpvoted
            ? p.upvotesCount - 1
            : p.upvotesCount + 1;
          return {
            ...p,
            hasUpvoted: !p.hasUpvoted,
            upvotesCount: newUpvoteCount,
          };
        }
        return p;
      })
    );

    try {
      await fetch("/api/discussions/upvote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submittedProjectId: projectId }),
      });
    } catch (error) {
      console.error("Failed to upvote:", error);
    }
  };

  const handleNewComment = (projectId: string, newComment: Comment) => {
    const addCommentRecursively = (comments: Comment[]): Comment[] => {
      for (let i = 0; i < comments.length; i++) {
        const comment = comments[i];
        if (comment.id === newComment.parentId) {
          const updatedComment = {
            ...comment,
            replies: [...(comment.replies || []), newComment],
          };
          return [
            ...comments.slice(0, i),
            updatedComment,
            ...comments.slice(i + 1),
          ];
        }

        if (comment.replies && comment.replies.length > 0) {
          const updatedReplies = addCommentRecursively(comment.replies);

          if (updatedReplies !== comment.replies) {
            const updatedComment = { ...comment, replies: updatedReplies };
            return [
              ...comments.slice(0, i),
              updatedComment,
              ...comments.slice(i + 1),
            ];
          }
        }
      }

      return comments;
    };

    setProjects((prevProjects) =>
      prevProjects.map((p) => {
        if (p.id === projectId) {
          if (!newComment.parentId) {
            return { ...p, comments: [...p.comments, newComment] };
          }
          const updatedComments = addCommentRecursively(p.comments);
          return { ...p, comments: updatedComments };
        }
        return p;
      })
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#262626]">
        <Loader2 className="w-10 h-10 animate-spin text-white" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#262626] text-red-400">
        Error: {error}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#262626] p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8 tracking-wider">
          Community Projects
        </h1>
        <div className="space-y-6">
          {projects.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              onUpvote={() => handleUpvote(p.id)}
              onNewComment={handleNewComment}
            />
          ))}
        </div>
      </div>
    </main>
  );
}
