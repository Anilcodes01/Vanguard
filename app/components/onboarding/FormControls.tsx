"use client";

import { Check, Sparkles } from "lucide-react";
import React, { InputHTMLAttributes } from "react";

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const TextInput: React.FC<TextInputProps> = ({ label, id, ...props }) => (
  <div className="relative">
    <input
      {...props}
      id={id}
      className="peer w-full rounded-md border border-gray-600 bg-transparent px-4 py-2.5 text-white placeholder-transparent focus:border-green-500 focus:outline-none"
      placeholder={label}
    />
    <label
      htmlFor={id}
      className="absolute -top-2.5 left-3 cursor-text bg-[#262626] px-1 text-sm text-gray-400 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-green-500"
    >
      {label}
    </label>
  </div>
);

interface SingleChoiceProps {
  label: string;
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
}

export const ChoiceButtons: React.FC<SingleChoiceProps> = ({ label, options, selected, onSelect }) => (
  <div>
    <label className="text-sm text-gray-400 mb-2 block">{label}</label>
    <div className="flex flex-wrap gap-3">
      {options.map((opt: string) => (
        <button
          key={opt}
          type="button"
          onClick={() => onSelect(opt)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            selected === opt
              ? "bg-green-600 text-white shadow-lg"
              : "bg-neutral-800 text-gray-300 hover:bg-neutral-700"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  </div>
);

export const SegmentedControl: React.FC<SingleChoiceProps> = ({ label, options, selected, onSelect }) => (
    <div>
      <label className="text-sm text-gray-400 mb-2 block">{label}</label>
      <div className="flex w-full bg-neutral-800 rounded-lg p-1">
        {options.map((opt: string) => (
          <button
            key={opt}
            type="button"
            onClick={() => onSelect(opt)}
            className={`w-full text-center px-4 py-2 rounded-md text-sm font-medium transition-all ${
              selected === opt
                ? "bg-green-600 text-white shadow"
                : "text-gray-300 hover:bg-neutral-700"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );

interface ChoiceGridProps extends SingleChoiceProps {
    isBadge?: boolean;
    description?: boolean;
}

export const ChoiceGrid: React.FC<ChoiceGridProps> = ({ label, options, selected, onSelect, isBadge, description }) => (
    <div>
      <label className="text-sm text-gray-400 mb-2 block">{label}</label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {options.map((opt: string) => {
          const isSelected = selected === opt;
          const mainText = description ? opt.split("(")[0].trim() : opt;
          const subText = description ? opt.match(/\((.*?)\)/)?.[1] : null;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onSelect(opt)}
              className={`p-4 rounded-lg text-left transition-all border-2 ${
                isSelected
                  ? "border-green-500 bg-green-900/50"
                  : "border-gray-700 bg-neutral-800 hover:bg-neutral-700"
              }`}
            >
              <div className="flex items-center">
                {isBadge && <Sparkles className="h-5 w-5 mr-3 text-yellow-400" />}
                <span className="font-semibold text-white">{mainText}</span>
                {isSelected && <Check className="ml-auto h-5 w-5 text-green-500" />}
              </div>
              {subText && <p className="text-xs text-gray-400 mt-1">{subText}</p>}
            </button>
          );
        })}
      </div>
    </div>
  );

interface MultiChoiceGridProps {
    label: string;
    options: string[];
    selected: string[];
    onSelect: (value: string) => void;
}
  
export const MultiChoiceGrid: React.FC<MultiChoiceGridProps> = ({ label, options, selected, onSelect }) => (
    <div>
      <label className="text-sm text-gray-400 mb-2 block">{label}</label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {options.map((opt: string) => {
          const isSelected = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onSelect(opt)}
              className={`p-3 rounded-lg text-left transition-all border flex items-center text-sm ${
                isSelected
                  ? "border-green-600 bg-green-900/30"
                  : "border-gray-700 bg-neutral-800 hover:bg-neutral-700"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-sm flex-shrink-0 mr-3 border-2 flex items-center justify-center ${
                  isSelected ? "bg-green-600 border-green-500" : "border-gray-500"
                }`}
              >
                {isSelected && <Check className="h-3 w-3 text-white" />}
              </div>
              <span className="text-gray-200">{opt}</span>
            </button>
          );
        })}
      </div>
    </div>
);