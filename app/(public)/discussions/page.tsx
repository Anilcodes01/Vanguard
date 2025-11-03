"use client";

import React, { useEffect, useState, FormEvent } from "react";
import {
  Loader2,
  Github,
  Link as LinkIcon,
  MessageCircle,
  ArrowBigUp,
  Send,
} from "lucide-react";
import Image from "next/image";
import { ProjectSubmission, Comment } from "@/types";

export default function DiscussionsPage() {
  const [projects, setProjects] = useState<ProjectSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch("/api/discussions/projects");
        if (!response.ok) {
          throw new Error("Failed to fetch projects.");
        }
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
      setProjects((prevProjects) =>
        prevProjects.map((p) => {
          if (p.id === projectId) {
            const newUpvoteCount = p.hasUpvoted
              ? p.upvotesCount + 1
              : p.upvotesCount - 1;
            return {
              ...p,
              hasUpvoted: !p.hasUpvoted,
              upvotesCount: newUpvoteCount,
            };
          }
          return p;
        })
      );
    }
  };

  const handleAddComment = (projectId: string, newComment: Comment) => {
    setProjects((prevProjects) =>
      prevProjects.map((p) =>
        p.id === projectId ? { ...p, comments: [...p.comments, newComment] } : p
      )
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
              onAddComment={handleAddComment}
            />
          ))}
        </div>
      </div>
    </main>
  );
}

function ProjectCard({
  project,
  onUpvote,
  onAddComment,
}: {
  project: ProjectSubmission;
  onUpvote: () => void;
  onAddComment: (projectId: string, newComment: Comment) => void;
}) {
  const [showComments, setShowComments] = useState(false);
  const userProfile = project.user.profiles?.[0];

  return (
    <div className="bg-[#333] border border-neutral-700 rounded-lg p-6">
      <div className="flex items-start gap-4 mb-4">
        <Image
          src={userProfile?.avatar_url || "/default-avatar.png"}
          alt={userProfile?.name || userProfile?.username || "User"}
          width={40}
          height={40}
          className="rounded-full h-12 w-12"
        />
        <div>
          <h2 className="text-xl font-bold text-white">
            {project.project.name}
          </h2>
          <p className="text-sm text-neutral-400">
            Submitted by{" "}
            {userProfile?.name || userProfile?.username || "Anonymous"}
          </p>
        </div>
      </div>

      {project.description && (
        <p className="text-neutral-300 mb-4 whitespace-pre-wrap">
          {project.description}
        </p>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        {project.builtWith.map((tech) => (
          <span
            key={tech}
            className="bg-neutral-700 text-xs text-neutral-200 px-2 py-1 rounded"
          >
            {tech}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-4 text-neutral-400 mb-6">
        {project.githubUrl && (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Github className="w-4 h-4" /> GitHub
          </a>
        )}
        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <LinkIcon className="w-4 h-4" /> Live Demo
          </a>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-neutral-700 pt-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onUpvote}
            className="flex items-center gap-2 text-neutral-300 hover:text-white transition-colors"
          >
            <ArrowBigUp
              className={`w-6 h-6 ${
                project.hasUpvoted ? "text-green-500 fill-current" : ""
              }`}
            />
            {project.upvotesCount}
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 text-neutral-300 hover:text-white transition-colors"
          >
            <MessageCircle className="w-5 h-5" /> {project.comments.length}
          </button>
        </div>
      </div>

      {showComments && (
        <CommentSection project={project} onAddComment={onAddComment} />
      )}
    </div>
  );
}

function CommentSection({
  project,
  onAddComment,
}: {
  project: ProjectSubmission;
  onAddComment: (projectId: string, newComment: Comment) => void;
}) {
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/discussions/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submittedProjectId: project.id,
          text: commentText,
        }),
      });
      const newComment = await response.json();
      if (response.ok) {
        onAddComment(project.id, newComment);
        setCommentText("");
      }
    } catch (error) {
      console.error("Failed to post comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-neutral-700">
      <form onSubmit={handleSubmit} className="flex items-center gap-2 mb-4">
        <input
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Add a comment..."
          className="block w-full rounded-md border-0 bg-[#222] py-2 px-3 text-white placeholder:text-neutral-500 focus:ring-2 focus:ring-inset focus:ring-green-500"
        />
        <button
          type="submit"
          disabled={isSubmitting || !commentText.trim()}
          className="p-2 rounded-md bg-green-600 text-white disabled:opacity-50 transition-colors"
        >
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </form>

      <div className="space-y-4">
        {project.comments.map((comment) => {
          const userProfile = comment.user.profiles?.[0];
          return (
            <div key={comment.id} className="flex items-start gap-3">
              <Image
                src={userProfile?.avatar_url || "/default-avatar.png"}
                alt={userProfile?.name || userProfile?.username || "User"}
                width={32}
                height={32}
                className="rounded-full mt-1 h-8 w-8"
              />
              <div className="bg-neutral-700 rounded-lg p-3 w-full">
                <p className="text-sm font-semibold text-white">
                  {userProfile?.name || userProfile?.username || "Anonymous"}
                </p>
                <p className="text-sm text-neutral-300">{comment.text}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
