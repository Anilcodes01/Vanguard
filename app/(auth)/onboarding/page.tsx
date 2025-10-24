"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image"; 
import toast from "react-hot-toast"; 
import { UploadCloud } from "lucide-react"; 

const domainOptions = [
  "Web Development",
  "Mobile Development",
  "Data Science & AI",
  "Cloud Computing & DevOps",
  "Cybersecurity",
  "Game Development",
  "UI/UX Design",
  "Other",
];

export default function OnboardingPage() {
  const [domain, setDomain] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File is too large. Please select an image under 5MB.");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Invalid file type. Please select an image.");
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!domain) {
      toast.error("Please select a domain.");
      return;
    }
    setIsSubmitting(true);
    const toastId = toast.loading("Saving your profile...");

    const formData = new FormData();
    formData.append("domain", domain);
    formData.append("college_name", collegeName);
    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }

    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile.");
      }

      toast.success("Profile updated successfully!", { id: toastId });

      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      let errorMessage = "An unexpected error occurred.";
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#262626] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">
            Complete Your Profile
          </h1>
          <p className="mt-2 text-gray-400">
            Tell us a bit more about yourself.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <input
              id="avatar"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative h-32 w-32 rounded-full border-2 border-dashed border-gray-600 bg-gray-800/50 flex items-center justify-center text-gray-400 transition-all hover:border-green-500 cursor-pointer hover:bg-gray-800 overflow-hidden"
            >
              {avatarPreview ? (
                <Image
                  src={avatarPreview}
                  alt="Avatar Preview"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex flex-col items-center">
                  <UploadCloud size={32} />
                  <span className="mt-2 text-xs font-semibold">
                    Upload Photo
                  </span>
                </div>
              )}
            </button>
          </div>

          <div className="relative">
            <select
              id="domain"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              required
              className={`peer w-full appearance-none rounded-md border border-gray-600 bg-transparent px-4 py-2.5 text-white focus:border-green-500 focus:outline-none ${
                domain ? "text-white" : "text-gray-400"
              }`}
            >
              <option value="" disabled>
                Select your domain...
              </option>
              {domainOptions.map((opt) => (
                <option
                  key={opt}
                  value={opt}
                  className="bg-[#262626] text-white"
                >
                  {opt}
                </option>
              ))}
            </select>
            <label
              htmlFor="domain"
              className="absolute -top-3.5 left-3 bg-[#262626] px-1 text-sm text-gray-400 transition-all peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-green-500"
            >
              Primary Domain
            </label>
          </div>

          <div className="relative">
            <input
              id="collegeName"
              type="text"
              value={collegeName}
              onChange={(e) => setCollegeName(e.target.value)}
              required
              className="peer w-full rounded-md border border-gray-600 bg-transparent px-4 py-2 text-white placeholder-transparent focus:border-green-500 focus:outline-none"
              placeholder="College Name"
            />
            <label
              htmlFor="collegeName"
              className="absolute -top-3.5 left-3 bg-[#262626] px-1 text-sm text-gray-400 transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-green-500"
            >
              College Name
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center cursor-pointer justify-center gap-2 rounded-md bg-green-600 py-2.5 font-semibold text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-[#262626] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "Saving..." : "Save and Continue"}
          </button>
        </form>
      </div>
    </div>
  );
}
