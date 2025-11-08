"use client";

import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { ProjectSubmission, Comment } from "@/types";
import ProjectCard from "@/app/components/discussions/DiscussionsProjectCard";
import ProjectModal from "@/app/components/discussions/ProjectModal";

export default function DiscussionsPage() {
  const [projects, setProjects] = useState<ProjectSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] =
    useState<ProjectSubmission | null>(null);

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
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const handleUpvote = async (projectId: string) => {
    const updater = (prevProjects: ProjectSubmission[]) =>
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
      });

    setProjects(updater);

    if (selectedProject?.id === projectId) {
      setSelectedProject((prev) => {
        if (!prev) return null;
        const newUpvoteCount = prev.hasUpvoted
          ? prev.upvotesCount - 1
          : prev.upvotesCount + 1;
        return {
          ...prev,
          hasUpvoted: !prev.hasUpvoted,
          upvotesCount: newUpvoteCount,
        };
      });
    }

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
    const addCommentRecursively = (
      comments: Comment[],
      commentToAdd: Comment
    ): Comment[] => {
      for (let i = 0; i < comments.length; i++) {
        const comment = comments[i];
        if (comment.id === commentToAdd.parentId) {
          const updatedComment = {
            ...comment,
            replies: [...(comment.replies || []), commentToAdd],
          };
          return [
            ...comments.slice(0, i),
            updatedComment,
            ...comments.slice(i + 1),
          ];
        }
        if (comment.replies?.length) {
          const updatedReplies = addCommentRecursively(
            comment.replies,
            commentToAdd
          );
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

    const projectUpdater = (prevProjects: ProjectSubmission[]) =>
      prevProjects.map((p) => {
        if (p.id === projectId) {
          const updatedComments = newComment.parentId
            ? addCommentRecursively(p.comments, newComment)
            : [...p.comments, newComment];
          return {
            ...p,
            comments: updatedComments,
            commentsCount: p.commentsCount + 1,
          };
        }
        return p;
      });

    setProjects(projectUpdater);

    if (selectedProject?.id === projectId) {
      setSelectedProject((prev) => {
        if (!prev) return null;
        const updatedComments = newComment.parentId
          ? addCommentRecursively(prev.comments, newComment)
          : [...prev.comments, newComment];
        return {
          ...prev,
          comments: updatedComments,
          commentsCount: prev.commentsCount + 1,
        };
      });
    }
  };

  const openModal = (project: ProjectSubmission) => {
    setSelectedProject(project);
  };

  const closeModal = () => {
    setSelectedProject(null);
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
         <div className="space-y-3"> 
          {projects
            .sort((a, b) => b.upvotesCount - a.upvotesCount)
            .map((p, index) => (
              <ProjectCard
                key={p.id}
                project={p}
                rank={index + 1} 
                onClick={() => openModal(p)}
                onUpvote={() => handleUpvote(p.id)}
              />
            ))}
        </div>
      </div>
    {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={closeModal}
          onUpvote={handleUpvote}
          onNewComment={handleNewComment}
        />
      )}
    </main>
  );
}

