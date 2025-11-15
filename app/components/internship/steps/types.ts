export interface OnboardingFormData {
  domain: string;
  name: string;
  college_name: string;
  year_of_study: string;
  primary_field: string;
  comfort_level: string;
  preferred_langs: string[];
  platform_exp: string;
  challenge_pref: string[];
  main_goal: string[];
  time_dedication: string;
  motivation: string[];
  internship_interest: string;
  role_interest: string[];
  project_pref: string;
  playstyle: string;
  first_badge: string;
}

export type ProfileType = {
  id: string;
  name: string | null;
  username: string | null;
  avatar_url: string | null;
  onboarded: boolean;
  domain: string | null;
  college_name: string | null;
  year_of_study: string | null;
  primary_field: string | null;
  comfort_level: string | null;
  preferred_langs: string[];
  platform_exp: string | null;
  main_goal: string[];
  challenge_pref: string[];
  motivation: string[];
  time_dedication: string | null;
  internship_interest: string | null;
  role_interest: string[];
  project_pref: string | null;
  playstyle: string | null;
  first_badge: string | null;
  internshipEnrolled: boolean;
};

export interface Step1Props {
  formData: OnboardingFormData;
  setFormData: React.Dispatch<React.SetStateAction<OnboardingFormData>>;
  avatarPreview: string | null;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  openDomainPopover: boolean;
  setOpenDomainPopover: React.Dispatch<React.SetStateAction<boolean>>;
}
