"use client";

import React, { useEffect } from "react";
import { X, Github, ExternalLink, Calendar, User } from "lucide-react";
import { ProjectData } from "../types";

interface HellipadModalProps {
  project: ProjectData | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function HellipadModal({
  project,
  isOpen,
  onClose,
}: HellipadModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !project) return null;

  const authorProfile = project.internshipWeek.user.profiles[0];
  const authorName =
    authorProfile?.name || authorProfile?.username || "Anonymous";
  const displayTitle = project.customTitle || project.title;
  const displayDescription = project.shortDescription || project.description;
  const tags = project.tags || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {}
      <div
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {}
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {}
        <div className="flex items-start justify-between p-6 md:p-8 border-b border-gray-100 bg-white z-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              {displayTitle}
            </h2>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                <span>{authorName}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(project.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {}
        <div className="overflow-y-auto p-6 md:p-8 space-y-8">
          {}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {}
            <div className="space-y-4">
              <div className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50 aspect-video flex items-center justify-center relative group">
                {project.screenshots && project.screenshots.length > 0 ? (
                  <img
                    src={project.screenshots[0]}
                    alt="Project screenshot"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-6">
                    <span className="text-4xl">🚀</span>
                    <p className="text-gray-400 text-sm mt-2">
                      No preview available
                    </p>
                  </div>
                )}
              </div>

              {}
              <div className="flex gap-3">
                {project.liveLink && (
                  <a
                    href={project.liveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-medium py-2.5 rounded-xl transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Live Demo
                  </a>
                )}
                {project.githubLink && (
                  <a
                    href={project.githubLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-medium py-2.5 rounded-xl transition-colors"
                  >
                    <Github className="w-4 h-4" />
                    Source Code
                  </a>
                )}
              </div>
            </div>

            {}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  About
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  {displayDescription}
                </p>
              </div>

              {tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-3">
                    Tech Stack
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {}
          {project.overview && (
            <div className="pt-8 border-t border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Project Overview
              </h3>
              <div className="prose prose-orange max-w-none text-gray-600">
                {}
                <div className="whitespace-pre-wrap">{project.overview}</div>
              </div>
            </div>
          )}

          {}
          {project.screenshots && project.screenshots.length > 1 && (
            <div className="pt-8 border-t border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Gallery</h3>
              <div className="grid grid-cols-2 gap-4">
                {project.screenshots.slice(1).map((shot, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg overflow-hidden border border-gray-200"
                  >
                    <img
                      src={shot}
                      alt={`Gallery ${idx}`}
                      className="w-full h-auto object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
