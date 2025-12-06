"use client";

import { useState, useRef, useEffect } from "react";
import { createJournalPost } from "@/app/actions/JournalActions";
import { Loader2, PenLine, X } from "lucide-react";
import Image from "next/image";

const MAX_CHARS = 300;

export default function CreateJournalModal({
  userAvatar,
}: {
  userAvatar?: string | null;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const formRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    } else {
      setCharCount(0);
    }
  }, [isOpen]);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    try {
      await createJournalPost(formData);

      window.dispatchEvent(new Event("journal_created"));

      setIsOpen(false);
      formRef.current?.reset();
      setCharCount(0);
    } catch (error) {
      console.error("Failed to post", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  const getCounterColor = () => {
    if (charCount >= MAX_CHARS) return "text-red-500";
    if (charCount >= MAX_CHARS - 30) return "text-orange-500";
    return "text-gray-300";
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-2 px-5 py-2.5 rounded-2xl font-medium transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
      >
        <PenLine className="w-4 h-4" />
        <span className="hidden sm:inline">Write Journal</span>
        <span className="sm:hidden">Write</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/20 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-[24px] shadow-2xl ring-1 ring-black/5 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center px-6 pt-6 pb-2">
              <span className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                New Entry
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-800 p-2 rounded-full hover:bg-gray-50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form ref={formRef} action={handleSubmit} className="px-6 pb-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  <div className="h-11 w-11 rounded-full bg-gray-50 overflow-hidden relative ring-1 ring-gray-100">
                    {userAvatar ? (
                      <Image
                        src={userAvatar}
                        alt="Me"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-orange-50 flex items-center justify-center text-orange-500 font-bold text-sm">
                        ME
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-grow">
                  <textarea
                    ref={textareaRef}
                    name="content"
                    maxLength={MAX_CHARS}
                    onChange={(e) => setCharCount(e.target.value.length)}
                    placeholder="What's on your mind?"
                    className="w-full min-h-[150px] resize-none 
                    bg-transparent border-none p-0
                    text-xl text-gray-800 placeholder-gray-300 leading-relaxed
                    focus:ring-0 focus:outline-none focus:border-none"
                    required
                  />

                  {}
                  <div className="flex justify-end mt-2">
                    <span
                      className={`text-xs font-medium transition-colors ${getCounterColor()}`}
                    >
                      {charCount} / {MAX_CHARS}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end items-center gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || charCount === 0}
                  className="bg-black hover:bg-gray-800 text-white px-6 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-black/10"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Post"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
