import { useState, useEffect, useRef } from "react";
import {
  Github,
  Link as LinkIcon,
  Loader2,
  Send,
  Code,
  FileText,
  ImageUp,
  X,
  Type,
} from "lucide-react";
import { SubmissionFormProps } from "@/types";
import Image from "next/image";

export default function SubmissionForm({
  handleSubmit,
  name,
  setName,
  shortDescription,
  setShortDescription,
  description,
  setDescription,
  builtWith,
  setBuiltWith,
  githubUrl,
  setGithubUrl,
  liveUrl,
  setLiveUrl,
  handleCoverImageChange,
  handleScreenshotsChange,
  onRemoveCoverImage,
  onRemoveScreenshot,
  isSubmitting,
  isUploading,
  submissionStatus,
  coverImageFile,
  screenshotFiles,
}: SubmissionFormProps) {
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(
    null
  );
  const [screenshotsPreview, setScreenshotsPreview] = useState<string[]>([]);

  const coverImageInputRef = useRef<HTMLInputElement>(null);
  const screenshotsInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let objectUrl: string | null = null;
    if (coverImageFile) {
      objectUrl = URL.createObjectURL(coverImageFile);
      setCoverImagePreview(objectUrl);
    } else {
      setCoverImagePreview(null);
    }

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [coverImageFile]);

  useEffect(() => {
    const objectUrls = screenshotFiles.map((file) => URL.createObjectURL(file));
    setScreenshotsPreview(objectUrls);

    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [screenshotFiles]);

  const handleRemoveCoverImage = () => {
    onRemoveCoverImage();
    if (coverImageInputRef.current) {
      coverImageInputRef.current.value = "";
    }
  };

  const handleRemoveScreenshot = (indexToRemove: number) => {
    onRemoveScreenshot(indexToRemove);
    if (screenshotsInputRef.current) {
      screenshotsInputRef.current.value = "";
    }
  };

  return (
    <div className="bg-[#1a1a1a] p-8 rounded-lg shadow-2xl w-full max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">
        Showcase Your Project
      </h2>
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-neutral-300 mb-1"
              >
                Project Name (Optional)
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Type className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full rounded-md border-0 bg-[#222] py-2.5 pl-10 text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500"
                  placeholder="Leave blank to use the default name"
                />
              </div>
            </div>
          
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-neutral-300 mb-1"
              >
                Description (Optional)
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 pt-2.5">
                  <FileText className="h-5 w-5 text-gray-400" />
                </div>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="block w-full rounded-md border-0 bg-[#222] py-2.5 pl-10 text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500"
                  placeholder="A detailed description of your project..."
                />
              </div>
            </div>
            
            <div>
              <label
                htmlFor="githubUrl"
                className="block text-sm font-medium text-neutral-300 mb-1"
              >
                GitHub Repository URL*
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Github className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="url"
                  id="githubUrl"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="block w-full rounded-md border-0 bg-[#222] py-2.5 pl-10 text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500"
                  placeholder="https://github.com/user/repo"
                  required
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="liveUrl"
                className="block text-sm font-medium text-neutral-300 mb-1"
              >
                Live Deployed URL (Optional)
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <LinkIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="url"
                  id="liveUrl"
                  value={liveUrl}
                  onChange={(e) => setLiveUrl(e.target.value)}
                  className="block w-full rounded-md border-0 bg-[#222] py-2.5 pl-10 text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500"
                  placeholder="https://my-project.vercel.app"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="builtWith"
                className="block text-sm font-medium text-neutral-300 mb-1"
              >
                Technologies Used*
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Code className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="builtWith"
                  value={builtWith}
                  onChange={(e) => setBuiltWith(e.target.value)}
                  className="block w-full rounded-md border-0 bg-[#222] py-2.5 pl-10 text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500"
                  placeholder="Next.js, Tailwind CSS, Prisma"
                  required
                />
              </div>
            </div>
           
          </div>

          <div className="space-y-6">
               <div>
              <label
                htmlFor="shortDescription"
                className="block text-sm font-medium text-neutral-300 mb-1"
              >
                Short Description (Optional)
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 pt-2.5">
                  <FileText className="h-5 w-5 text-gray-400" />
                </div>
                <textarea
                  id="shortDescription"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  rows={2}
                  className="block w-full rounded-md border-0 bg-[#222] py-2.5 pl-10 text-white placeholder-gray-500 focus:ring-2 focus:ring-green-500"
                  placeholder="A brief summary of your project..."
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">
                Cover Image (Optional)
              </label>
              <div className="mt-2 flex justify-center rounded-lg border border-dashed border-neutral-600 px-6 py-10">
                {coverImagePreview ? (
                  <div className="relative">
                    <Image
                      src={coverImagePreview}
                      alt="Cover preview"
                      className="max-h-40 rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveCoverImage}
                      className="absolute top-0 right-0 -m-2 bg-red-600 rounded-full p-1 text-white hover:bg-red-500 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <ImageUp
                      className="mx-auto h-12 w-12 text-neutral-500"
                      aria-hidden="true"
                    />
                    <div className="mt-4 flex justify-center text-sm leading-6 text-neutral-400">
                      <label
                        htmlFor="coverImage"
                        className="relative cursor-pointer rounded-md font-semibold text-green-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-green-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-900 hover:text-green-300"
                      >
                        <span>Upload a file</span>
                        <input
                          id="coverImage"
                          name="coverImage"
                          type="file"
                          className="sr-only"
                          onChange={handleCoverImageChange}
                          accept="image/*"
                          ref={coverImageInputRef}
                        />
                      </label>
                    </div>
                    <p className="text-xs leading-5 text-neutral-500">
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">
                Project Screenshots (Optional)
              </label>
              <div className="mt-2 flex items-center justify-center rounded-lg border border-dashed border-neutral-600 px-6 py-10">
                {screenshotsPreview.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {screenshotsPreview.map((src, index) => (
                      <div key={src} className="relative">
                        <Image
                          src={src}
                          alt={`Screenshot preview ${index + 1}`}
                          className="rounded-lg object-cover w-full h-full"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveScreenshot(index)}
                          className="absolute top-0 right-0 -m-2 bg-red-600 rounded-full p-1 text-white hover:bg-red-500 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center">
                    <ImageUp
                      className="mx-auto h-12 w-12 text-neutral-500"
                      aria-hidden="true"
                    />
                    <div className="mt-4 flex justify-center text-sm leading-6 text-neutral-400">
                      <label
                        htmlFor="screenshots"
                        className="relative cursor-pointer rounded-md font-semibold text-green-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-green-500 focus-within:ring-offset-2 focus-within:ring-offset-gray-900 hover:text-green-300"
                      >
                        <span>Upload files</span>
                        <input
                          id="screenshots"
                          name="screenshots"
                          type="file"
                          multiple
                          className="sr-only"
                          onChange={handleScreenshotsChange}
                          accept="image/*"
                          ref={screenshotsInputRef}
                        />
                      </label>
                    </div>
                    <p className="text-xs leading-5 text-neutral-500">
                      Upload up to 4 images
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isSubmitting || !githubUrl || !builtWith}
            className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-green-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-green-500 disabled:opacity-50 transition-colors duration-200"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>
                  {isUploading ? "Uploading images..." : "Submitting..."}
                </span>
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                <span>Submit Project</span>
              </>
            )}
          </button>
        </div>
        {submissionStatus.message && (
          <p
            className={`text-sm text-center ${
              submissionStatus.type === "success"
                ? "text-green-400"
                : "text-red-400"
            }`}
          >
            {submissionStatus.message}
          </p>
        )}
      </form>
    </div>
  );
}
