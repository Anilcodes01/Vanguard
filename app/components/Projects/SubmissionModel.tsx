"use client";

import SubmissionForm from "./SubmissionForm";
import { X } from "lucide-react";
import { SubmissionModalProps } from "@/types";

export default function SubmissionModal({
  isOpen,
  onClose,
  ...formProps
}: SubmissionModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-md bg-opacity-70 ">
      <div className="relative w-full max-w-4xl mx-4">
        <SubmissionForm {...formProps} />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 hover:text-black"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}