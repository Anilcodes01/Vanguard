"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Lottie from "lottie-react";
import toast from "react-hot-toast";
import { ProgressBar } from "@/app/components/onboarding/Progressbar";
import { InternshipStep1 } from "./steps/InternshipStep1";
import { InternshipStep2 } from "./steps/InternshipStep2";
import { InternshipStep3 } from "./steps/InternshipStep3";
import { Button } from "@/components/ui/button";
import { OnboardingFormData, ProfileType } from "./steps/types";

const LoadingSpinner = () => (
  <div className="border-4 border-t-4 border-gray-200 border-t-[#f59120] rounded-full w-12 h-12 animate-spin"></div>
);

const reviewSteps = [
  { num: 1, title: "Identity" },
  { num: 2, title: "Skills" },
  { num: 3, title: "Goals" },
];
const TOTAL_STEPS = reviewSteps.length;

export default function NotEnrolled() {
  const [animationData, setAnimationData] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [viewState, setViewState] = useState("centered");
  const [isLoading, setIsLoading] = useState(false);
  const [greeting, setGreeting] = useState("");
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingFormData>({
    domain: "",
    name: "",
    college_name: "",
    year_of_study: "",
    primary_field: "",
    comfort_level: "",
    preferred_langs: [],
    platform_exp: "",
    challenge_pref: [],
    main_goal: [],
    time_dedication: "",
    motivation: [],
    internship_interest: "",
    role_interest: [],
    project_pref: "",
    playstyle: "",
    first_badge: "",
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openDomainPopover, setOpenDomainPopover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/bot.json")
      .then((response) => response.json())
      .then((data) => setAnimationData(data))
      .catch((error) => console.error("Error loading animation:", error));
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

  const nextStep = () =>
    setStep((prev) => (prev < TOTAL_STEPS ? prev + 1 : prev));
  const prevStep = () => setStep((prev) => (prev > 1 ? prev - 1 : prev));

  const handleGetStarted = async () => {
    setIsLoading(true);
    setViewState("side-by-side");
    try {
      const response = await fetch("/api/internship/greet", { method: "POST" });
      if (!response.ok) throw new Error("Failed to fetch profile data");

      const data: { greeting: string; profileData: ProfileType } =
        await response.json();
      setGreeting(data.greeting);

      if (data.profileData) {
        setFormData((prev) => ({
          ...prev,
          ...(data.profileData as Partial<OnboardingFormData>),
        }));
        if (data.profileData.avatar_url)
          setAvatarPreview(data.profileData.avatar_url);
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred.";
      toast.error(`Failed to load profile: ${message}`);
      setGreeting("Sorry, I couldn't prepare your greeting. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // async function send() {
  //   setIsLoading(true);
  //   setViewState("side-by-side");
  //   try {
  //     const response = await fetch("/api/internship/callAI", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({}),
  //     });

  //     if (!response.ok) {
  //       throw new Error("Failed to get a response from the AI.");
  //     }

  //     const data: { greeting: string; profileData: ProfileType } =
  //       await response.json();

  //     setGreeting(data.greeting);

  //     if (data.profileData) {
  //       setFormData((prev) => ({
  //         ...prev,
  //         ...(data.profileData as Partial<OnboardingFormData>),
  //       }));
  //       if (data.profileData.avatar_url) {
  //         setAvatarPreview(data.profileData.avatar_url);
  //       }
  //     }
  //   } catch (error) {
  //     const message =
  //       error instanceof Error
  //         ? error.message
  //         : "An unexpected error occurred.";
  //     toast.error(`Failed to load profile: ${message}`);
  //     setGreeting("Sorry, I couldn't prepare your greeting. Please try again.");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (step < TOTAL_STEPS) {
      nextStep();
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("Saving your changes...");

    const formPayload = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (Array.isArray(value))
        value.forEach((item) => formPayload.append(key, item));
      else if (value) formPayload.append(key, value as string);
    });
    if (avatarFile) formPayload.append("avatar", avatarFile);

    try {
      const response = await fetch("/api/internship/onboarding", {
        method: "POST",
        body: formPayload,
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update profile.");
      }
      toast.success("Profile updated successfully!", { id: toastId });
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      toast.error(message, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderContent = () => {
    switch (step) {
      case 1:
        return (
          <InternshipStep1
            formData={formData}
            setFormData={setFormData}
            avatarPreview={avatarPreview}
            fileInputRef={fileInputRef}
            handleFileChange={handleFileChange}
            openDomainPopover={openDomainPopover}
            setOpenDomainPopover={setOpenDomainPopover}
          />
        );
      case 2:
        return (
          <InternshipStep2 formData={formData} setFormData={setFormData} />
        );
      case 3:
        return (
          <InternshipStep3 formData={formData} setFormData={setFormData} />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen justify-center items-center text-black overflow-hidden">
      <div
        className={`fixed inset-0 flex justify-center items-center pointer-events-none ${
          viewState === "centered" ? " bg-opacity-50" : "" // Add base bg if missing
        }`}
      >
        <div
          className={`modal-transition rounded-lg p-8 text-center pointer-events-auto ${
            viewState === "centered" ? "modal-center" : "modal-left"
          }`}
        >
          {animationData && (
            <Lottie
              animationData={animationData}
              loop={true}
              style={{ height: 200, width: "100%" }}
            />
          )}
          {viewState === "centered" ? (
            <>
              <h2 className="text-2xl font-bold mt-4 mb-2">Welcome!</h2>
              <p className="mb-6">
                It looks like you haven&apos;t enrolled yet. Let&apos;s review
                your profile and get you started!
              </p>
              <Button
                onClick={handleGetStarted}
                className="bg-[#f59120] hover:bg-orange-600"
              >
                Get Started now
              </Button>
            </>
          ) : (
            <div className="mt-4">
              {isLoading ? (
                <p>Personalizing your welcome...</p>
              ) : (
                <p className="text-left">{greeting}</p>
              )}
            </div>
          )}
        </div>

        {viewState === "side-by-side" && (
          <div className="profile-panel absolute right-0 top-0 h-full w-1/2 flex items-center justify-center bg-white opacity-0 animate-fade-in overflow-y-auto pointer-events-auto">
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <div className="w-full max-w-2xl p-8">
                <h3 className="text-2xl font-bold mb-4 text-center">
                  Review Your Profile
                </h3>
                <p className="text-center text-gray-600 mb-6">
                  Confirm your details to tailor the best experience for you.
                </p>
                <ProgressBar currentStep={step} steps={reviewSteps} />
                <form onSubmit={handleFormSubmit} className="mt-8">
                  {renderContent()}
                  <div className="mt-8 flex justify-between items-center">
                    <Button
                      type="button"
                      onClick={prevStep}
                      disabled={step === 1 || isSubmitting}
                      variant="ghost"
                      className="hover:bg-gray-100"
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-8 bg-orange-600 hover:bg-orange-700"
                    >
                      {isSubmitting
                        ? "Saving..."
                        : step === TOTAL_STEPS
                        ? "Save & Enroll"
                        : "Continue"}
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
