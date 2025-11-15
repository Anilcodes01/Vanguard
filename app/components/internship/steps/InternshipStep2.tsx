import React from "react";
import { Code } from "lucide-react";
import { SectionHeader } from "@/app/components/onboarding/SectionHeader";
import { ChoiceButtons, SegmentedControl, MultiChoiceGrid } from "@/app/components/onboarding/FormControls";
import { OnboardingFormData } from "./types";

interface StepProps {
  formData: OnboardingFormData;
  setFormData: React.Dispatch<React.SetStateAction<OnboardingFormData>>;
}

export const InternshipStep2: React.FC<StepProps> = ({ formData, setFormData }) => (
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
  </div>
);