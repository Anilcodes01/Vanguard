"use client";

import { useState, KeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, X } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";

// 1. We import the isolated component we created in the previous step
// Make sure the path matches where you saved TextEditor.tsx
const TextEditor = dynamic(() => import("../../../components/journal/TextEditor"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gray-50 animate-pulse rounded-xl border border-gray-100" />
  ),
});

export default function Publish() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    content: "",
    tags: [] as string[],
  });

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newTag = tagInput.trim();

      if (newTag && !formData.tags.includes(newTag)) {
        setFormData({
          ...formData,
          tags: [...formData.tags, newTag],
        });
        setTagInput("");
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.content) {
      alert("Please fill in the title and content.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/journal/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        router.push("/journal");
        router.refresh();
      } else {
        alert("Failed to save journal");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <Link
          href="/journal"
          className="flex items-center text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Journals
        </Link>

        <button
          onClick={handleSubmit}
          disabled={loading || !formData.title || !formData.content}
          className="flex items-center gap-2 bg-orange-400 hover:bg-orange-500 text-white px-6 py-2 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Publish
        </button>
      </div>

      <div className="space-y-6">
        <input
          type="text"
          placeholder="Journal Title"
          className="w-full text-4xl md:text-5xl font-bold placeholder-gray-300 border-none outline-none bg-transparent text-gray-900"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />

        <input
          type="text"
          placeholder="Short description or summary..."
          className="w-full text-lg text-gray-600 placeholder-gray-300 border-none outline-none bg-transparent italic"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
        />

        <div className="flex flex-wrap items-center gap-2 min-h-[32px]">
          {formData.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-medium border-orange-500 border text-orange-700 group transition-colors hover:border-gray-300"
            >
              {tag}
              <button
                onClick={() => removeTag(tag)}
                className="text-gray-400 hover:text-red-500 transition-colors focus:outline-none ml-0.5"
                type="button"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          <input
            type="text"
            placeholder={formData.tags.length === 0 ? "Add tags..." : "+ tag"}
            className="bg-transparent outline-none text-sm text-gray-600 placeholder-gray-400 min-w-[80px] py-1"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
          />
        </div>

        <div className="h-[60vh] pb-12">
          {/* 
             2. CRITICAL CHANGE: 
             Use <TextEditor> instead of <ReactQuill>.
             This ensures the heavy JS is lazy-loaded.
          */}
          <TextEditor
            theme="snow"
            value={formData.content}
            onChange={(value) => setFormData({ ...formData, content: value })}
            className="h-full"
            placeholder="Write your thoughts here..."
            modules={{
              toolbar: [
                [{ header: [1, 2, false] }],
                ["bold", "italic", "underline", "strike", "blockquote"],
                [{ list: "ordered" }, { list: "bullet" }],
                ["link", "code-block"],
                ["clean"],
              ],
            }}
          />
        </div>
      </div>

      {/* 
         3. KEEP THESE STYLES:
         Even though we moved the library CSS to TextEditor.tsx,
         these are your custom overrides for this specific page.
         They are fine to stay here.
      */}
      <style jsx global>{`
        .ql-toolbar.ql-snow {
          border: none !important;
          border-bottom: 1px solid #e5e7eb !important;
          padding-left: 0 !important;
          margin-top: 10px;
        }
        .ql-container.ql-snow {
          border: none !important;
          font-size: 1.125rem; /* text-lg */
          font-family: inherit;
        }
        .ql-editor {
          padding-left: 0 !important;
          padding-right: 0 !important;
          color: #374151; /* gray-700 */
        }
        .ql-editor.ql-blank::before {
          color: #d1d5db; /* gray-300 */
          font-style: normal;
        }
      `}</style>
    </div>
  );
}