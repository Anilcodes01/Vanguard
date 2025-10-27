"use client";

import {
  useState,
  useRef,
  FormEvent,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ProgressBar } from "@/app/components/onboarding/Progressbar";
import { Step1 } from "@/app/components/onboarding/Step1";
import { Step2 } from "@/app/components/onboarding/Step2";
import { Step3 } from "@/app/components/onboarding/Step3";
import { Step4 } from "@/app/components/onboarding/Step4";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

const Button = ({ children, ...props }: ButtonProps) => (
  <button
    {...props}
    className={`flex items-center justify-center gap-2 rounded-md py-2.5 font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-[#262626] disabled:cursor-not-allowed disabled:opacity-60 ${props.className}`}
  >
    {children}
  </button>
);

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    domain: "",
    name: "",
    college_name: "",
    year_of_study: "",
    primary_field: "",
    comfort_level: "",
    preferred_langs: [] as string[],
    platform_exp: "",
    challenge_pref: [] as string[],
    main_goal: [] as string[],
    time_dedication: "",
    motivation: [] as string[],
    internship_interest: "",
    role_interest: [] as string[],
    project_pref: "",
    playstyle: "",
    first_badge: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openDomainPopover, setOpenDomainPopover] = useState(false);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (step < 4) {
      if (step === 1 && (!formData.name || !formData.domain))
        return toast.error("Please enter your name and select a domain.");
      if (step === 2 && !formData.primary_field)
        return toast.error("Please select your primary field.");
      if (step === 3 && formData.main_goal.length === 0)
        return toast.error("Please select at least one goal.");
      nextStep();
      return;
    }

    if (!formData.playstyle || !formData.first_badge)
      return toast.error("Please make your final selections.");

    setIsSubmitting(true);
    const toastId = toast.loading("Finalizing your profile...");

    const formPayload = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (Array.isArray(value))
        value.forEach((item) => formPayload.append(key, item));
      else if (value) formPayload.append(key, value);
    });
    if (avatarFile) formPayload.append("avatar", avatarFile);

    try {
      const response = await fetch("/api/onboarding", {
        method: "POST",
        body: formPayload,
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to update profile.");
      toast.success("Welcome! Your adventure begins now.", { id: toastId });
      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      toast.error(message, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#262626] px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">
            Coder&apos;s Initiation
          </h1>
          <p className="mt-2 text-gray-400">
            A few quick questions to personalize your journey.
          </p>
        </div>
        <ProgressBar currentStep={step} />
        <form onSubmit={handleSubmit} className="mt-8">
          {step === 1 && (
            <Step1
              formData={formData}
              setFormData={setFormData}
              avatarPreview={avatarPreview}
              // @ts-expect-error The prop type is valid but TypeScript struggles with the ref.
              fileInputRef={fileInputRef}
              handleFileChange={handleFileChange}
              openDomainPopover={openDomainPopover}
              setOpenDomainPopover={setOpenDomainPopover}
            />
          )}
          {step === 2 && (
            <Step2 formData={formData} setFormData={setFormData} />
          )}
          {step === 3 && (
            <Step3 formData={formData} setFormData={setFormData} />
          )}
          {step === 4 && (
            <Step4 formData={formData} setFormData={setFormData} />
          )}
          <div className="mt-8 flex justify-between items-center">
            <Button
              type="button"
              onClick={prevStep}
              disabled={step === 1 || isSubmitting}
              className="text-gray-400 hover:bg-neutral-800 hover:text-white"
            >
              Back
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-8 bg-green-600 hover:bg-green-700"
            >
              {isSubmitting
                ? "Saving..."
                : step === 4
                ? "Complete Initiation"
                : "Continue"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
