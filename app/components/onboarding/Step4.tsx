import React from "react";
import { Gamepad2 } from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import { ChoiceGrid } from "./FormControls";

interface OnboardingFormData {
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

interface StepProps {
  formData: OnboardingFormData;
  setFormData: React.Dispatch<React.SetStateAction<OnboardingFormData>>;
}

export const Step4: React.FC<StepProps> = ({ formData, setFormData }) => (
  <div className="space-y-8 animate-fade-in">
    <SectionHeader
      icon={Gamepad2}
      title="Step 4: Your Style"
      subtitle="Questions 15-16: Define your coder persona."
    />
    <ChoiceGrid
      label="If coding were a game, how would you describe your playstyle?"
      options={[
        "The Explorer (learns everything)",
        "The Strategist (plans before coding)",
        "The Speedrunner (solves fast)",
        "The Perfectionist (polishes every detail)",
      ]}
      selected={formData.playstyle}
      onSelect={(val: string) => setFormData({ ...formData, playstyle: val })}
      description={true}
    />
    <ChoiceGrid
      label="Claim Your First Badge!"
      options={[
        "Rising Coder",
        "Project Pioneer",
        "Bug Slayer",
        "AI Whisperer",
      ]}
      selected={formData.first_badge}
      onSelect={(val: string) => setFormData({ ...formData, first_badge: val })}
      isBadge={true}
    />
  </div>
);
