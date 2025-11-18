"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Github,
  Link as LinkIcon,
  ArrowBigUp,
  MessageCircle,
  Bookmark,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { ProjectSubmission, Comment } from "@/types";

const DynamicCommentSection = dynamic(() => import("./CommentSection"), {
  loading: () => <p>Loading comments...</p>,
});

interface ProjectModalProps {
  project: ProjectSubmission;
  isLoading: boolean;
  isBookmarking: boolean;
  onClose: () => void;
  onUpvote: (projectId: string) => void;
  onNewComment: (projectId: string, newComment: Comment) => void;
  onBookmark: (projectId: string) => void;
  onToggleCommentLike: (commentId: string, hasLiked: boolean) => void;
}

export default function ProjectModal({
  project,
  onClose,
  isLoading,
  isBookmarking,
  onUpvote,
  onNewComment,
  onBookmark,
  onToggleCommentLike,
}: ProjectModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const userProfile = project.user.profiles?.[0];

  const allImages = [project.coverImage, ...(project.screenshots || [])].filter(
    Boolean
  ) as string[];
  const [selectedImage, setSelectedImage] = useState<string>(
    allImages[0] || ""
  );

  useEffect(() => {
    setSelectedImage(allImages[0] || "");
  }, [project.id]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 200);
  };

  return (
    <div
      className={`fixed inset-0 bg-black/20 backdrop-blur-md z-50   flex justify-center items-center p-4 transition-opacity duration-200 ${
        isClosing ? "opacity-0" : "opacity-100"
      }`}
      onClick={handleClose}
    >
      <div
        className={`bg-white border border-gray-200 rounded-2xl w-full max-w-6xl max-h-[90vh] shadow-2xl flex flex-col transition-all duration-300 ${
          isClosing ? "opacity-0 scale-95" : "opacity-100 scale-100"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-gray-200 flex-shrink-0">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4 flex-1">
              <Image
                src={userProfile?.avatar_url || "/user.png"}
                alt={userProfile?.name || "User"}
                width={48}
                height={48}
                className="rounded-full h-12 w-12 ring-2 ring-gray-200"
              />
              <div>
                <h2 className="text-xl font-bold text-black">
                  {project.name || project.project.name}
                </h2>
                <p className="text-sm text-gray-600">
                  by {userProfile?.name || userProfile?.username || "Anonymous"}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-black transition-all duration-300 hover:rotate-90 p-1 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex-1 flex justify-center min-h-screen items-center p-10">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 lg:grid-cols-3 gap-6 scrollbar-none">
            <div className="lg:col-span-2 flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative aspect-video rounded-lg overflow-hidden bg-gray-100">
                {selectedImage ? (
                  <Image
                    src={selectedImage}
                    alt="Selected project view"
                    fill
                    className="object-contain"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No image available
                  </div>
                )}
              </div>
              {allImages.length > 1 && (
                <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto md:h-[250px] lg:h-[350px] pb-2 scrollbar-none">
                  {allImages.map((url, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(url)}
                      className={`relative flex-shrink-0 w-24 h-14 md:w-28 md:h-16 rounded-md overflow-hidden ring-2 transition-all duration-200 ${
                        selectedImage === url
                          ? "ring-[#f59120]"
                          : "ring-transparent hover:ring-gray-500"
                      }`}
                    >
                      <Image
                        src={url}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:col-span-1 space-y-5">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => onUpvote(project.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-medium text-sm transition-all ${
                    project.hasUpvoted
                      ? "bg-[#f59120]/10 text-orange-400 border border-[#f59120]/30"
                      : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
                  }`}
                >
                  <ArrowBigUp
                    className={`w-5 h-5 ${
                      project.hasUpvoted && "fill-current"
                    }`}
                  />
                  <span>{project.upvotesCount}</span>
                </button>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-100 text-gray-600 border border-gray-200 font-medium text-sm">
                  <MessageCircle className="w-4 h-4" />
                  <span>{project.commentsCount}</span>
                </div>
                <button
                  onClick={() => onBookmark(project.id)}
                  disabled={isBookmarking}
                  className={`flex items-center justify-center gap-2 px-3 py-1.5 rounded-md font-medium text-sm transition-all w-24
                    ${
                      project.hasBookmarked
                        ? "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                        : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
                    } ${isBookmarking ? "cursor-not-allowed" : ""}`}
                >
                  {isBookmarking ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Bookmark
                        className={`w-4 h-4 ${
                          project.hasBookmarked && "fill-current"
                        }`}
                      />
                      <span>{project.bookmarksCount}</span>
                    </>
                  )}
                </button>

                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200 hover:text-black transition-colors text-sm font-medium"
                  >
                    <Github className="w-4 h-4" /> Code
                  </a>
                )}
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200 hover:text-black transition-colors text-sm font-medium"
                  >
                    <LinkIcon className="w-4 h-4" /> Demo
                  </a>
                )}
              </div>

              {project.short_description && (
                <div>
                  <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                    {project.short_description}
                  </p>
                </div>
              )}

              {project.description && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Description
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                    {project.description}
                  </p>
                </div>
              )}

              {project.builtWith?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Built With
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {project.builtWith.map((tech) => (
                      <span
                        key={tech}
                        className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-md border border-gray-200"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-3 pt-4 border-t border-gray-200">
              <DynamicCommentSection
                project={project}
                onNewComment={onNewComment}
                onToggleCommentLike={onToggleCommentLike}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
