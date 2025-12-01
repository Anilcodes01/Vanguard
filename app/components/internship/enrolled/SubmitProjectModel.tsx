"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { X, Github, Globe, Loader2, Upload, Plus } from "lucide-react";
import { createClient } from "@/app/utils/supabase/client";
import Image from "next/image";

interface SubmitProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    customTitle: string;
    shortDescription: string;
    tags: string[];
    githubLink: string;
    liveLink: string;
    overview: string;
    screenshots: string[];
  }) => Promise<void>;
  isSubmitting: boolean;
}

export default function SubmitProjectModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: SubmitProjectModalProps) {
  const [customTitle, setCustomTitle] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const [githubLink, setGithubLink] = useState("");
  const [liveLink, setLiveLink] = useState("");
  const [overview, setOverview] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  if (!isOpen) return null;

  const handleAddTag = (e?: React.MouseEvent) => {
    e?.preventDefault();
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const newPreviews = filesArray.map((file) => URL.createObjectURL(file));
      setSelectedFiles((prev) => [...prev, ...filesArray]);
      setPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    const newFiles = [...selectedFiles];
    const newPreviews = [...previews];
    URL.revokeObjectURL(newPreviews[index]);
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    setSelectedFiles(newFiles);
    setPreviews(newPreviews);
  };

  const uploadImagesToSupabase = async (): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    for (const file of selectedFiles) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}-${Math.random()
        .toString(36)
        .substring(7)}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from("SubmittedInternshipProjectImages")
        .upload(fileName, file);

      if (error) throw new Error(`Failed to upload ${file.name}`);
      const {
        data: { publicUrl },
      } = supabase.storage
        .from("SubmittedInternshipProjectImages")
        .getPublicUrl(data.path);
      uploadedUrls.push(publicUrl);
    }
    return uploadedUrls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle || !shortDescription) {
      alert("Please fill in the Project Name and Short Description.");
      return;
    }

    try {
      setIsUploading(true);
      const screenshotUrls = await uploadImagesToSupabase();
      await onSubmit({
        customTitle,
        shortDescription,
        tags,
        githubLink,
        liveLink,
        overview,
        screenshots: screenshotUrls,
      });
    } catch (error) {
      console.error(error);
      alert("Error submitting project. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-200 my-8">
        {}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-2xl">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              Submit Your Work
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Showcase what you built.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {}
        <div className="max-h-[80vh] overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {}
            <div className="space-y-6">
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-b pb-2">
                General Info
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Project Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TaskMaster Pro"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Tech Stack (Tags)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Next.js"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="bg-gray-100 hover:bg-gray-200 p-3 rounded-lg text-gray-600 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                  {}
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 border border-orange-100"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="hover:text-red-500"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Short Description (Catchy One-liner){" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="A real-time task management app with AI features."
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                />
              </div>
            </div>

            {}
            <div className="space-y-6">
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide border-b pb-2">
                Project Links
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Github className="w-4 h-4" /> GitHub Repository
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://github.com/username/repo"
                    value={githubLink}
                    onChange={(e) => setGithubLink(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                  />
                </div>
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
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                  />
                </div>
              </div>
            </div>

            {}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                  Screenshots
                </h4>
                <span className="text-xs text-gray-500">
                  {selectedFiles.length} images selected
                </span>
              </div>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-all group"
              >
                <Upload className="w-8 h-8 text-gray-400 group-hover:text-orange-500 mb-2" />
                <p className="text-sm text-gray-600 font-medium">
                  Click to upload screenshots
                </p>
                <input
                  type="file"
                  ref={fileInputRef}
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>
              {previews.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-4">
                  {previews.map((src, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-video rounded-lg overflow-hidden group border border-gray-200"
                    >
                      <Image
                        src={src}
                        alt="Preview"
                        width={300}
                        height={300}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {}
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2 border-b pb-2 w-full">
                Detailed Overview
              </label>
              <textarea
                required
                rows={6}
                placeholder="Describe what you built, features, and flow..."
                value={overview}
                onChange={(e) => setOverview(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none text-sm font-mono"
              />
            </div>
          </form>
        </div>

        {}
        <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting || isUploading}
            className="px-6 py-2.5 rounded-xl font-semibold text-sm text-gray-700 bg-white border border-gray-200 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || isUploading}
            className="flex items-center gap-2 px-8 py-2.5 rounded-xl font-semibold text-sm text-white bg-orange-600 hover:bg-orange-700 transition-all shadow-lg hover:shadow-orange-500/30 disabled:opacity-70"
          >
            {isSubmitting || isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />{" "}
                {isUploading ? "Uploading..." : "Submitting..."}
              </>
            ) : (
              "Submit Project"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
