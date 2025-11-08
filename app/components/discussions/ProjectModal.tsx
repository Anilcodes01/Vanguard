"use client";

import React from "react";
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
  const userProfile = project.user.profiles?.[0];

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex justify-center items-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-[#2d2d2d] border border-[#404040] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-[#404040]">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-start gap-4 flex-1">
              <Image
                src={userProfile?.avatar_url || "/user.png"}
                alt={userProfile?.name || userProfile?.username || "User"}
                width={48}
                height={48}
                className="rounded-full h-12 w-12 ring-2 ring-[#404040]"
              />
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-1">
                  {project.project.name}
                </h2>
                <p className="text-sm text-neutral-500">
                  by{" "}
                  <span className="text-neutral-400 font-medium">
                    {userProfile?.name || userProfile?.username || "Anonymous"}
                  </span>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-neutral-500 hover:text-white transition-all duration-300 hover:rotate-90 p-1 rounded-lg hover:bg-[#404040]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onUpvote(project.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 hover:scale-105 active:scale-95 ${
                project.hasUpvoted
                  ? "bg-green-500/10 text-green-400 border border-green-500/30 shadow-lg shadow-green-500/20"
                  : "bg-[#333] text-neutral-400 border border-[#404040] hover:bg-[#3a3a3a] hover:border-[#505050]"
              }`}
            >
              <ArrowBigUp
                className={`w-5 h-5 transition-transform duration-300 ${
                  project.hasUpvoted ? "fill-current" : ""
                }`}
              />
              <span className="text-sm">{project.upvotesCount}</span>
            </button>

            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#333] text-neutral-400 border border-[#404040]">
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm font-medium">
                {project.commentsCount}
              </span>
            </div>

            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#333] text-neutral-400 border border-[#404040] hover:bg-[#3a3a3a] hover:border-[#505050] hover:text-white transition-all duration-300"
              >
                <Github className="w-4 h-4" />
                <span className="text-sm font-medium">Code</span>
              </a>
            )}

            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#333] text-neutral-400 border border-[#404040] hover:bg-[#3a3a3a] hover:border-[#505050] hover:text-white transition-all duration-300"
              >
                <LinkIcon className="w-4 h-4" />
                <span className="text-sm font-medium">Demo</span>
              </a>
            )}
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {project.description && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-3">
                Description
              </h3>
              <p className="text-neutral-300 leading-relaxed whitespace-pre-wrap">
                {project.description}
              </p>
            </div>
          )}

          {project.builtWith && project.builtWith.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-3">
                Built With
              </h3>
              <div className="flex flex-wrap gap-2">
                {project.builtWith.map((tech) => (
                  <span
                    key={tech}
                    className="bg-[#333] text-neutral-300 text-xs font-medium px-3 py-1.5 rounded-lg border border-[#404040] hover:border-[#505050] transition-colors duration-300"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          <CommentSection project={project} onNewComment={onNewComment} />
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}