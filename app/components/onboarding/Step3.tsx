import React from "react";
import { Rocket } from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import { MultiChoiceGrid, ChoiceButtons } from "./FormControls";

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

export const Step3: React.FC<StepProps> = ({ formData, setFormData }) => (
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
    <MultiChoiceGrid
      label="What kind of challenges do you enjoy the most?"
      options={[
        "Algorithmic problems",
        "Real-world projects",
        "AI/ML-based challenges",
        "Web development tasks",
        "Problem-solving contests",
      ]}
      selected={formData.challenge_pref}
      onSelect={(val: string) =>
        setFormData({
          ...formData,
          challenge_pref: formData.challenge_pref.includes(val)
            ? formData.challenge_pref.filter((p: string) => p !== val)
            : [...formData.challenge_pref, val],
        })
      }
    />
    <MultiChoiceGrid
      label="What motivates you the most?"
      options={[
        "Competing with others",
        "Learning new skills",
        "Earning points and badges",
        "Building portfolio-worthy projects",
      ]}
      selected={formData.motivation}
      onSelect={(val: string) =>
        setFormData({
          ...formData,
          motivation: formData.motivation.includes(val)
            ? formData.motivation.filter((m: string) => m !== val)
            : [...formData.motivation, val],
        })
      }
    />
    <ChoiceButtons
      label="How much time can you dedicate per week to practice here?"
      options={[
        "Less than 2 hours",
        "2–5 hours",
        "5–10 hours",
        "More than 10 hours",
      ]}
      selected={formData.time_dedication}
      onSelect={(val: string) =>
        setFormData({ ...formData, time_dedication: val })
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
      <div className="space-y-8 border-l-2 border-green-500 pl-6 animate-fade-in">
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
