"use client";

import { useState } from "react";
import { X, Github, Globe, Loader2 } from "lucide-react";

interface SubmitProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (githubLink: string, liveLink: string) => Promise<void>;
  isSubmitting: boolean;
}

export default function SubmitProjectModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: SubmitProjectModalProps) {
  const [githubLink, setGithubLink] = useState("");
  const [liveLink, setLiveLink] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(githubLink, liveLink);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">Submit Project</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Github Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Github className="w-4 h-4" /> GitHub Repository URL
            </label>
            <input
              type="url"
              required
              placeholder="https://github.com/username/repo"
              value={githubLink}
              onChange={(e) => setGithubLink(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-sm"
            />
          </div>

          {/* Live Link Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Globe className="w-4 h-4" /> Live Demo URL
            </label>
            <input
              type="url"
              required
              placeholder="https://my-project.vercel.app"
              value={liveLink}
              onChange={(e) => setLiveLink(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-sm"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 rounded-xl font-semibold text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm text-white bg-orange-600 hover:bg-orange-700 transition-all shadow-lg hover:shadow-orange-500/30 disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Work"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}