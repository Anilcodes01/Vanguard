import React from "react";
import { Code } from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import {
  ChoiceButtons,
  SegmentedControl,
  MultiChoiceGrid,
} from "./FormControls";

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

export const Step2: React.FC<StepProps> = ({ formData, setFormData }) => (
  <div className="space-y-8 animate-fade-in">
    <SectionHeader
      icon={Code}
      title="Step 2: Your Arsenal"
      subtitle="Questions 4-6 & 8: Tell us about your technical skills."
    />
    <ChoiceButtons
      label="What’s your primary field of study?"
      options={["Computer Science", "IT", "Electronics", "Other"]}
      selected={formData.primary_field}
      onSelect={(val: string) =>
        setFormData({ ...formData, primary_field: val })
      }
    />
    <SegmentedControl
      label="How comfortable are you with programming right now?"
      options={["Beginner", "Intermediate", "Advanced"]}
      selected={formData.comfort_level}
      onSelect={(val: string) =>
        setFormData({ ...formData, comfort_level: val })
      }
    />
    <MultiChoiceGrid
      label="Which programming languages do you prefer to code in?"
      options={["Python", "C++", "Java", "JavaScript", "Other"]}
      selected={formData.preferred_langs}
      onSelect={(val: string) =>
        setFormData({
          ...formData,
          preferred_langs: formData.preferred_langs.includes(val)
            ? formData.preferred_langs.filter((l: string) => l !== val)
            : [...formData.preferred_langs, val],
        })
      }
    />
    <ChoiceButtons
      label="Have you ever used LeetCode, HackerRank, or any coding challenge platform before?"
      options={["Yes", "No"]}
      selected={formData.platform_exp}
      onSelect={(val: string) =>
        setFormData({ ...formData, platform_exp: val })
      }
    />
  </div>
);