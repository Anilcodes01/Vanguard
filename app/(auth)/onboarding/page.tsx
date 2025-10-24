"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import toast from "react-hot-toast";
import { UploadCloud, Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

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
  const [open, setOpen] = useState(false);

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
              className="relative h-32 w-32 rounded-full border-2 border-dashed border-gray-600 bg-green-800/50 flex items-center justify-center text-gray-400 transition-all hover:border-green-500 cursor-pointer hover:bg-green-800 overflow-hidden"
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

          <div>
            <label className="text-sm text-gray-400 mb-2 block">
              Primary Domain
            </label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between bg-transparent border-gray-600 text-white hover:bg-neutral-800 hover:text-white focus:border-green-500 h-auto py-2.5"
                >
                  {domain
                    ? domainOptions.find((opt) => opt === domain)
                    : "Select your domain..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-neutral-800 border-gray-700 text-white">
                <Command className="bg-neutral-800 text-white">
                  <CommandInput
                    placeholder="Search domain..."
                    className="h-9 border-gray-700 placeholder:text-gray-500"
                  />
                  <CommandEmpty>No domain found.</CommandEmpty>
                  <CommandList>
                    <CommandGroup>
                      {domainOptions.map((opt) => (
                        <CommandItem
                          key={opt}
                          value={opt}
                          onSelect={(currentValue) => {
                            setDomain(
                              currentValue === domain ? "" : currentValue
                            );
                            setOpen(false);
                          }}
                          className="aria-selected:bg-green-500/20 text-white cursor-pointer"
                        >
                          {opt}
                          <Check
                            className={cn(
                              "ml-auto h-4 w-4",
                              domain === opt ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="relative">
            <input
              id="collegeName"
              type="text"
              value={collegeName}
              onChange={(e) => setCollegeName(e.target.value)}
              className="peer w-full rounded-md border border-gray-600 bg-transparent px-4 py-2.5 text-white placeholder-transparent focus:border-green-500 focus:outline-none"
              placeholder="College Name"
            />
            <label
              htmlFor="collegeName"
              className="absolute -top-2.5 left-3 bg-[#262626] px-1 text-sm text-gray-400 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-green-500"
            >
              College Name (Optional)
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
