"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Github,
  Link as LinkIcon,
  ArrowBigUp,
  MessageCircle,
} from "lucide-react";
import Image from "next/image";
import CommentSection from "./CommentSection";
import { ProjectSubmission, Comment } from "@/types";

interface ProjectModalProps {
  project: ProjectSubmission;
  onClose: () => void;
  onUpvote: (projectId: string) => void;
  onNewComment: (projectId: string, newComment: Comment) => void;
}

export default function ProjectModal({
  project,
  onClose,
  onUpvote,
  onNewComment,
}: ProjectModalProps) {
  const [isClosing, setIsClosing] = useState(false);
  const userProfile = project.user.profiles?.[0];

  // --- State for the interactive image gallery ---
  const allImages = [project.coverImage, ...(project.screenshots || [])].filter(
    Boolean
  ) as string[];
  const [selectedImage, setSelectedImage] = useState<string>(allImages[0] || "");

  useEffect(() => {
    // Set the cover image as the default selected image when the project changes
    setSelectedImage(allImages[0] || "");
  }, [project.id]);

  // Handle closing animation
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 200); // Duration of the fade-out animation
  };

  return (
    <div
      className={`fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex justify-center items-center p-4 transition-opacity duration-200 ${
        isClosing ? "opacity-0" : "opacity-100"
      }`}
      onClick={handleClose}
    >
      <div
        className={`bg-[#2d2d2d] border border-[#404040] rounded-2xl w-full max-w-6xl max-h-[90vh] shadow-2xl flex flex-col transition-all duration-300 ${
          isClosing ? "opacity-0 scale-95" : "opacity-100 scale-100"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* --- MODAL HEADER --- */}
        <div className="p-5 border-b border-[#404040] flex-shrink-0">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4 flex-1">
              <Image
                src={userProfile?.avatar_url || "/user.png"}
                alt={userProfile?.name || "User"}
                width={48}
                height={48}
                className="rounded-full h-12 w-12 ring-2 ring-[#404040]"
              />
              <div>
                <h2 className="text-xl font-bold text-white">
                  {project.project.name}
                </h2>
                <p className="text-sm text-neutral-400">
                  by {userProfile?.name || userProfile?.username || "Anonymous"}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-neutral-500 hover:text-white transition-all duration-300 hover:rotate-90 p-1 rounded-lg hover:bg-[#404040]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* --- MODAL BODY (SCROLLABLE) --- */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 lg:grid-cols-3 gap-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-[#2d2d2d] [&::-webkit-scrollbar-thumb]:bg-[#555] [&::-webkit-scrollbar-thumb]:rounded-full">
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-2 flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative aspect-video rounded-lg overflow-hidden bg-[#222]">
              {selectedImage ? (
                <Image
                  src={selectedImage}
                  alt="Selected project view"
                  fill
                  className="object-contain"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-neutral-500">
                  No image available
                </div>
              )}
            </div>
            {allImages.length > 1 && (
              <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto md:h-[250px] lg:h-[350px] pb-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#555] [&::-webkit-scrollbar-thumb]:rounded-full">
                {allImages.map((url, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(url)}
                    className={`relative flex-shrink-0 w-24 h-14 md:w-28 md:h-16 rounded-md overflow-hidden ring-2 transition-all duration-200 ${
                      selectedImage === url
                        ? "ring-green-500"
                        : "ring-transparent hover:ring-neutral-500"
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

          {/* Right Column: Project Details */}
          <div className="lg:col-span-1 space-y-5">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => onUpvote(project.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md font-medium text-sm transition-all ${
                  project.hasUpvoted
                    ? "bg-green-500/10 text-green-400 border border-green-500/30"
                    : "bg-[#333] text-neutral-300 border border-[#444] hover:bg-[#3a3a3a]"
                }`}
              >
                <ArrowBigUp className={`w-5 h-5 ${project.hasUpvoted && "fill-current"}`} />
                <span>{project.upvotesCount}</span>
              </button>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#333] text-neutral-300 border border-[#444] font-medium text-sm">
                <MessageCircle className="w-4 h-4" />
                <span>{project.commentsCount}</span>
              </div>
              {project.githubUrl && (
                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#333] text-neutral-300 border border-[#444] hover:bg-[#3a3a3a] hover:text-white transition-colors text-sm font-medium">
                  <Github className="w-4 h-4" /> Code
                </a>
              )}
              {project.liveUrl && (
                <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#333] text-neutral-300 border border-[#444] hover:bg-[#3a3a3a] hover:text-white transition-colors text-sm font-medium">
                  <LinkIcon className="w-4 h-4" /> Demo
                </a>
              )}
            </div>

            {project.short_description && (
              <div>
                {/* <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-2">Description</h3> */}
                <p className="text-neutral-300 text-sm leading-relaxed whitespace-pre-wrap">{project.short_description}</p>
              </div>
            )}

            {project.description && (
              <div>
                <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-2">Description</h3>
                <p className="text-neutral-300 text-sm leading-relaxed whitespace-pre-wrap">{project.description}</p>
              </div>
            )}

            {project.builtWith?.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-2">Built With</h3>
                <div className="flex flex-wrap gap-2">
                  {project.builtWith.map((tech) => (
                    <span key={tech} className="bg-[#333] text-neutral-300 text-xs font-medium px-2.5 py-1 rounded-md border border-[#444]">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Comment Section below the columns */}
          <div className="lg:col-span-3 pt-4 border-t border-[#404040]">
            <CommentSection project={project} onNewComment={onNewComment} />
          </div>
        </div>
      </div>
    </div>
  );
}