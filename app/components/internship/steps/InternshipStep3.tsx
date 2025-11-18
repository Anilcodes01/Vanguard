import React from "react";
import { Rocket } from "lucide-react";
import { SectionHeader } from "@/app/components/onboarding/SectionHeader";
import {
  MultiChoiceGrid,
  ChoiceButtons,
} from "@/app/components/onboarding/FormControls";
import { OnboardingFormData } from "./types";

interface StepProps {
  formData: OnboardingFormData;
  setFormData: React.Dispatch<React.SetStateAction<OnboardingFormData>>;
}

export const InternshipStep3: React.FC<StepProps> = ({
  formData,
  setFormData,
}) => (
  <div className="space-y-8 animate-fade-in">
    <SectionHeader
      icon={Rocket}
      title="Step 3: Your Quest"
      subtitle="Questions 7, 9-14: What are your goals?"
    />
    <MultiChoiceGrid
      label="What's your main goal for joining this platform?"
      options={[
        "To improve my coding skills",
        "To build real-world projects",
        "To gain internship experience",
        "To earn certificates and LORs",
        "To climb the leaderboard and test myself",
      ]}
      selected={formData.main_goal}
      onSelect={(val: string) =>
        setFormData({
          ...formData,
          main_goal: formData.main_goal.includes(val)
            ? formData.main_goal.filter((g: string) => g !== val)
            : [...formData.main_goal, val],
        })
      }
    />
    <ChoiceButtons
      label="Are you looking for internships after building a skill threshold here?"
      options={["Yes", "No", "Maybe later"]}
      selected={formData.internship_interest}
      onSelect={(val: string) =>
        setFormData({ ...formData, internship_interest: val })
      }
    />
    {(formData.internship_interest === "Yes" ||
      formData.internship_interest === "Maybe later") && (
      <div className="space-y-8 border-l-2 border-[#f59120] pl-6 animate-fade-in">
        <MultiChoiceGrid
          label="What kind of roles interest you the most?"
          options={[
            "Software Development",
            "Web Development",
            "Data Science / ML",
            "UI/UX or Product Design",
            "Other",
          ]}
          selected={formData.role_interest}
          onSelect={(val: string) =>
            setFormData({
              ...formData,
              role_interest: formData.role_interest.includes(val)
                ? formData.role_interest.filter((r: string) => r !== val)
                : [...formData.role_interest, val],
            })
          }
        />
        <ChoiceButtons
          label="What kind of projects would you love to work on during your internship?"
          options={[
            "Individual",
            "Collaborative / Team-based",
            "Research-oriented",
          ]}
          selected={formData.project_pref}
          onSelect={(val: string) =>
            setFormData({ ...formData, project_pref: val })
          }
        />
      </div>
    )}
  </div>
);
