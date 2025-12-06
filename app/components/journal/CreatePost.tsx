"use client";

import { createJournalPost } from "@/app/actions/JournalActions";
import { Send, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { useFormStatus } from "react-dom";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-4 py-2 text-sm font-medium flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Posting...
        </>
      ) : (
        <>
          <Send className="w-4 h-4" />
          Post
        </>
      )}
    </button>
  );
}

export default function CreatePostForm({
  userAvatar,
}: {
  userAvatar?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);

  async function clientAction(formData: FormData) {
    const result = await createJournalPost(formData);
    if (result?.error) {
      setError(result.error);
    } else {
      setError(null);
      formRef.current?.reset();
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-4 mb-8 shadow-sm">
      <form ref={formRef} action={clientAction} className="flex gap-4">
        <div className="flex-shrink-0">
          {userAvatar ? (
            <Image
              src={userAvatar}
              alt="Me"
              className="w-10 h-10 rounded-full object-cover border border-gray-100"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
              Me
            </div>
          )}
        </div>
        <div className="flex-grow">
          <textarea
            name="content"
            placeholder="What's on your mind? Share your progress..."
            className="w-full resize-none border-none focus:ring-0 text-gray-800 text-lg placeholder-gray-400 min-h-[80px] bg-transparent p-0"
            required
          />
          {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
          <div className="flex justify-between items-center border-t border-gray-100 pt-3 mt-2">
            <div className="flex gap-2 text-orange-500">{}</div>
            <SubmitButton />
          </div>
        </div>
      </form>
    </div>
  );
}
