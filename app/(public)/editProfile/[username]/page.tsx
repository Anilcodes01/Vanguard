"use client";

import { useEffect, useState, FormEvent, useRef } from "react";
import Image from "next/image";
import { Loader2, UploadCloud } from "lucide-react";
import toast from "react-hot-toast";
import {
  TextInput,
  ChoiceButtons,
  SegmentedControl,
  MultiChoiceGrid,
} from "@/app/components/onboarding/FormControls";

const yearOptions = [
  "1st Year",
  "2nd Year",
  "3rd Year",
  "4th Year",
  "Graduate",
];
const domainOptions = [
  "Web Development",
  "Mobile Development",
  "Data Science & ML",
  "DevOps & Cloud",
  "Cybersecurity",
];
const comfortOptions = ["Beginner", "Intermediate", "Advanced"];
const languageOptions = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "C++",
  "Go",
  "Rust",
  "Ruby",
  "PHP",
  "Swift",
  "Kotlin",
  "C#",
];

type Profile = {
  name: string | null;
  username: string | null;
  avatar_url: string | null;
  domain: string | null;
  college_name: string | null;
  year_of_study: string | null;
  primary_field: string | null;
  comfort_level: string | null;
  preferred_langs: string[];
};

const initialProfileState: Profile = {
  name: "",
  username: "",
  avatar_url: "",
  domain: "",
  college_name: "",
  year_of_study: "",
  primary_field: "",
  comfort_level: "",
  preferred_langs: [],
};

export default function EditProfilePage() {
  const [profile, setProfile] = useState<Profile>(initialProfileState);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/profile");
        if (!response.ok) throw new Error("Failed to fetch profile data.");
        const data = await response.json();
        setProfile({ ...data, preferred_langs: data.preferred_langs || [] });
      } catch (err) {
        if (err instanceof Error) setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024)
        return toast.error("File is too large (max 5MB).");
      if (!file.type.startsWith("image/"))
        return toast.error("Please select an image file.");

      setAvatarFile(file);
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleSingleSelect = (field: keyof Profile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };
  const handleMultiLangSelect = (lang: string) => {
    setProfile((prev) => {
      const newLangs = prev.preferred_langs.includes(lang)
        ? prev.preferred_langs.filter((l) => l !== lang)
        : [...prev.preferred_langs, lang];
      return { ...prev, preferred_langs: newLangs };
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    const toastId = toast.loading("Saving changes...");

    const formPayload = new FormData();
    Object.entries(profile).forEach(([key, value]) => {
      if (key === "preferred_langs" && Array.isArray(value)) {
        value.forEach((lang) => formPayload.append(key, lang));
      } else if (value !== null && key !== "avatar_url") {
        formPayload.append(key, String(value));
      }
    });

    if (avatarFile) {
      formPayload.append("avatar", avatarFile);
    }

    try {
      const response = await fetch("/api/profile", {
        method: "POST",
        body: formPayload,
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Failed to save profile.");

      toast.success("Profile updated successfully!", { id: toastId });
      if (result.profile.avatar_url) {
        setProfile((prev) => ({
          ...prev,
          avatar_url: result.profile.avatar_url,
        }));
        setAvatarPreview(null);
      }
    } catch (err) {
      if (err instanceof Error) toast.error(err.message, { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#262626]">
        <Loader2 className="w-10 h-10 animate-spin text-white" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#262626] text-white p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Edit Profile</h1>
        <p className="text-neutral-400 mb-6">
          Keep your professional and skill information up to date.
        </p>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="border border-neutral-700 rounded-lg p-6 space-y-6">
            <div className="flex items-center gap-6">
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
                className="relative h-24 w-24 flex-shrink-0 rounded-full border-2 border-dashed border-gray-600 bg-neutral-800 flex items-center justify-center text-gray-400 transition-all hover:border-green-500 cursor-pointer hover:bg-neutral-700 overflow-hidden"
              >
                {avatarPreview || profile.avatar_url ? (
                  <Image
                    src={avatarPreview || profile.avatar_url!}
                    alt="Avatar Preview"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center">
                    <UploadCloud size={24} />
                    <span className="mt-1 text-xs font-semibold">Upload</span>
                  </div>
                )}
              </button>
              <div className="w-full space-y-4">
                <TextInput
                  label="Full Name"
                  id="name"
                  name="name"
                  value={profile.name || ""}
                  onChange={handleChange}
                />
                <TextInput
                  label="Username"
                  id="username"
                  name="username"
                  value={profile.username || ""}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="border border-neutral-700 rounded-lg p-6 space-y-6">
            <TextInput
              label="College/University"
              id="college_name"
              name="college_name"
              value={profile.college_name || ""}
              onChange={handleChange}
            />
            <TextInput
              label="Primary Field of Study"
              id="primary_field"
              name="primary_field"
              value={profile.primary_field || ""}
              onChange={handleChange}
            />
            <SegmentedControl
              label="Year of Study"
              options={yearOptions}
              selected={profile.year_of_study || ""}
              onSelect={(value) => handleSingleSelect("year_of_study", value)}
            />
          </div>

          <div className="border border-neutral-700 rounded-lg p-6 space-y-6">
            <ChoiceButtons
              label="Primary Domain"
              options={domainOptions}
              selected={profile.domain || ""}
              onSelect={(value) => handleSingleSelect("domain", value)}
            />
            <SegmentedControl
              label="Comfort Level with DSA"
              options={comfortOptions}
              selected={profile.comfort_level || ""}
              onSelect={(value) => handleSingleSelect("comfort_level", value)}
            />
            <MultiChoiceGrid
              label="Preferred Languages"
              options={languageOptions}
              selected={profile.preferred_langs || []}
              onSelect={handleMultiLangSelect}
            />
          </div>

          <div>
            {error && (
              <p className="text-red-400 text-sm text-center mb-4">{error}</p>
            )}
            <button
              type="submit"
              disabled={isSaving}
              className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-500 disabled:opacity-50 transition-all"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" /> Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
