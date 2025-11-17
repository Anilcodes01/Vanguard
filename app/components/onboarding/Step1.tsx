import React from "react";
import Image from "next/image";
import { UploadCloud, Check, User, ChevronsUpDown } from "lucide-react";
import { Button as UiButton } from "@/components/ui/button";
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
import { SectionHeader } from "./SectionHeader";
import { TextInput, ChoiceButtons } from "./FormControls";

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

interface Step1Props {
  formData: OnboardingFormData;
  setFormData: React.Dispatch<React.SetStateAction<OnboardingFormData>>;
  avatarPreview: string | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  openDomainPopover: boolean;
  setOpenDomainPopover: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Step1: React.FC<Step1Props> = ({
  formData,
  setFormData,
  avatarPreview,
  fileInputRef,
  handleFileChange,
  openDomainPopover,
  setOpenDomainPopover,
}) => (
  <div className="space-y-6 animate-fade-in">
    <SectionHeader
      icon={User}
      title="Step 1: Your Identity"
      subtitle="Questions 1-3: Let's start with the basics."
    />
    <div className="flex flex-col md:flex-row items-center gap-8">
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
          className="relative h-32 w-32 rounded-full border-2 border-dashed border-gray-600 bg-orange-800/50 flex items-center justify-center text-gray-400 transition-all hover:border-orange-500 cursor-pointer hover:bg-orange-800 overflow-hidden"
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
              <span className="mt-2 text-xs font-semibold">Upload Photo</span>
            </div>
          )}
        </button>
      </div>
      <div className="w-full space-y-6">
        <div>
          <label className="text-sm text-gray-600 mb-2 block">
            Primary Domain
          </label>
          <Popover open={openDomainPopover} onOpenChange={setOpenDomainPopover}>
            <PopoverTrigger asChild>
              <UiButton
                variant="outline"
                role="combobox"
                className="w-full justify-between bg-transparent border-gray-600 text-black hover:bg-gray-100 hover:text-black focus:border-orange-500 h-auto py-2.5"
              >
                {formData.domain || "Select your domain..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </UiButton>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-gray-800 border-gray-700 text-white">
              <Command>
                <CommandInput placeholder="Search domain..." />
                <CommandEmpty>No domain found.</CommandEmpty>
                <CommandList>
                  <CommandGroup>
                    {domainOptions.map((opt) => (
                      <CommandItem
                        key={opt}
                        value={opt}
                        onSelect={(currentValue: string) => {
                          setFormData({ ...formData, domain: currentValue });
                          setOpenDomainPopover(false);
                        }}
                      >
                        {opt}
                        <Check
                          className={cn(
                            "ml-auto h-4 w-4",
                            formData.domain === opt
                              ? "opacity-100"
                              : "opacity-0"
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
        <TextInput
          id="name"
          label="What’s your full name or nickname?"
          value={formData.name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData({ ...formData, name: e.target.value })
          }
          required
        />
      </div>
    </div>
    <TextInput
      id="college"
      label="Which college or university are you at?"
      value={formData.college_name}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
        setFormData({ ...formData, college_name: e.target.value })
      }
    />
    <ChoiceButtons
      label="What year of study are you in?"
      options={[
        "Freshman",
        "Sophomore",
        "Junior",
        "Senior",
        "Graduate",
        "Other",
      ]}
      selected={formData.year_of_study}
      onSelect={(val: string) =>
        setFormData({ ...formData, year_of_study: val })
      }
    />
  </div>
);