import { FormEvent, ChangeEvent } from "react";
import {
  Github,
  Link as LinkIcon,
  Loader2,
  Send,
  Code,
  FileText,
} from "lucide-react";

type SubmissionFormProps = {
  handleSubmit: (e: FormEvent) => void;
  description: string;
  setDescription: (value: string) => void;
  builtWith: string;
  setBuiltWith: (value: string) => void;
  githubUrl: string;
  setGithubUrl: (value: string) => void;
  liveUrl: string;
  setLiveUrl: (value: string) => void;
  handleCoverImageChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleScreenshotsChange: (e: ChangeEvent<HTMLInputElement>) => void;
  isSubmitting: boolean;
  isUploading: boolean;
  submissionStatus: {
    message: string | null;
    type: "success" | "error" | null;
  };
};

export default function SubmissionForm({
  handleSubmit,
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
  isSubmitting,
  isUploading,
  submissionStatus,
}: SubmissionFormProps) {
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-neutral-300 mb-1"
        >
          Short Description (Optional)
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <FileText className="h-5 w-5 text-gray-400" />
          </div>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="block w-full rounded-md border-0 bg-[#222] py-2.5 pl-10 text-white"
            placeholder="A brief summary of your project..."
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
            className="block w-full rounded-md border-0 bg-[#222] py-2.5 pl-10 text-white"
            placeholder="Next.js, Tailwind CSS, Prisma"
            required
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
            <Github className="w-5 w-5 text-gray-400" />
          </div>
          <input
            type="url"
            id="githubUrl"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            className="block w-full rounded-md border-0 bg-[#222] py-2.5 pl-10 text-white"
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
            className="block w-full rounded-md border-0 bg-[#222] py-2.5 pl-10 text-white"
            placeholder="https://my-project.vercel.app"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="coverImage"
          className="block text-sm font-medium text-neutral-300 mb-1"
        >
          Cover Image (Optional)
        </label>
        <div className="relative">
          <input
            type="file"
            id="coverImage"
            onChange={handleCoverImageChange}
            accept="image/*"
            className="block w-full text-sm text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-neutral-600 file:text-white hover:file:bg-neutral-500"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="screenshots"
          className="block text-sm font-medium text-neutral-300 mb-1"
        >
          Project Screenshots (Optional)
        </label>
        <div className="relative">
          <input
            type="file"
            id="screenshots"
            multiple
            onChange={handleScreenshotsChange}
            accept="image/*"
            className="block w-full text-sm text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-neutral-600 file:text-white hover:file:bg-neutral-500"
          />
        </div>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting || !githubUrl || !builtWith}
          className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {isUploading ? "Uploading images..." : "Submitting..."}
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Submit Project
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
  );
}