"use client";

import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { ProjectSubmission, Comment } from "@/types";
import ProjectCard from "@/app/components/discussions/DiscussionsProjectCard";
import dynamic from 'next/dynamic';
import { getProjectDetails } from "@/app/actions/getProjectDetails";

const DynamicProjectModal = dynamic(() => import('@/app/components/discussions/ProjectModal'));

interface DiscussionsListProps {
  initialProjects: ProjectSubmission[];
}

export default function DiscussionsList({ initialProjects }: DiscussionsListProps) {
  const [projects, setProjects] = useState(initialProjects);
  const [selectedProject, setSelectedProject] = useState<ProjectSubmission | null>(null);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [bookmarkingProjects, setBookmarkingProjects] = useState<Set<string>>(new Set());

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


  const handleToggleCommentLike = async (commentId: string, hasLiked: boolean) => {
    const toggleLikeRecursively = (
      comments: Comment[] | undefined
    ): Comment[] => {
      if (!Array.isArray(comments)) {
        return [];
      }

      return comments.map((comment) => {
        if (comment.id === commentId) {
          const newLikesCount = hasLiked
            ? comment.likesCount - 1
            : comment.likesCount + 1;
            
          return {
            ...comment,
            likesCount: newLikesCount,
            hasLiked: !hasLiked, 
          };
        }
        return {
          ...comment,
          replies: toggleLikeRecursively(comment.replies),
        };
      });
    };

    setProjects((prevProjects) =>
      prevProjects.map((p) => {
        if (p.id === selectedProject?.id) {
          return { ...p, comments: toggleLikeRecursively(p.comments) };
        }
        return p;
      })
    );

    if (selectedProject) {
      setSelectedProject((prev) => {
        if (!prev) return null;
        return { ...prev, comments: toggleLikeRecursively(prev.comments) };
      });
    }
    try {
      await fetch("/api/discussions/comments/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId }),
      });
    } catch (error) {
      console.error("Failed to toggle comment like:", error);
    }
  };

 const openModal = async (project: ProjectSubmission) => {
    setSelectedProject(project);
    setIsModalLoading(true);

    try {
      const detailedData = await getProjectDetails(project.id);
      
      setSelectedProject(detailedData as ProjectSubmission);

    } catch (err) {
      console.error(err);
      closeModal(); 
    } finally {
      setIsModalLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedProject(null);
  };

  const handleBookmark = async (projectId: string) => {
    setBookmarkingProjects((prev) => new Set(prev).add(projectId));

    const updater = (prevProjects: ProjectSubmission[]) =>
      prevProjects.map((p) => {
        if (p.id === projectId) {
          const currentBookmarks = p.bookmarksCount ?? 0;
          const newBookmarksCount = p.hasBookmarked
            ? currentBookmarks - 1
            : currentBookmarks + 1;
          return {
            ...p,
            hasBookmarked: !p.hasBookmarked,
            bookmarksCount: newBookmarksCount,
          };
        }
        return p;
      });

    setProjects(updater);

    if (selectedProject?.id === projectId) {
      setSelectedProject((prev) => {
        if (!prev) return null;
        const currentBookmarks = prev.bookmarksCount ?? 0;
        const newBookmarksCount = prev.hasBookmarked
          ? currentBookmarks - 1
          : currentBookmarks + 1;
        return {
          ...prev,
          hasBookmarked: !prev.hasBookmarked,
          bookmarksCount: newBookmarksCount,
        };
      });
    }

    try {
      await fetch("/api/discussions/bookmark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submittedProjectId: projectId }),
      });
    } catch (error) {
      console.error("Failed to update bookmark:", error);
    } finally {
      setBookmarkingProjects((prev) => {
        const newSet = new Set(prev);
        newSet.delete(projectId);
        return newSet;
      });
    }
  };

  return (
    <>
      <div className="space-y-3">
        {projects
          .map((p, index) => (
            <ProjectCard
              key={p.id}
              project={p}
              rank={index + 1}
              isBookmarking={bookmarkingProjects.has(p.id)}
              onClick={() => openModal(p)}
              onUpvote={() => handleUpvote(p.id)}
              onBookmark={() => handleBookmark(p.id)}
            />
          ))}
      </div>
      {selectedProject && (
        <DynamicProjectModal
          project={selectedProject}
          isLoading={isModalLoading}
          isBookmarking={bookmarkingProjects.has(selectedProject.id)}
          onClose={closeModal}
          onUpvote={handleUpvote}
          onNewComment={handleNewComment}
          onBookmark={handleBookmark}
          onToggleCommentLike={handleToggleCommentLike}
        />
      )}
    </>
  );
}