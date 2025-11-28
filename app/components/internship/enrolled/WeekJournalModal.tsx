"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  X,
  Save,
  Loader2,
  BookOpen,
  Code,
  FolderGit2,
  FileText,
} from "lucide-react";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import "react-quill-new/dist/quill.snow.css";

interface SimpleItem {
  id: string;
  title: string;
}

interface NoteEntry {
  id: string;
  content: string;
  internshipProblemId?: string | null;
  internshipProjectId?: string | null;
}

interface WeekJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  weekNumber: number;
  isLoading?: boolean;

  availableProblems: SimpleItem[];
  availableProjects: SimpleItem[];

  fetchedNotes: NoteEntry[];

  onSave: (
    content: string,
    type: "general" | "problem" | "project",
    entityId?: string
  ) => Promise<void>;
}

const modules = {
  toolbar: [
    [{ header: [1, 2, false] }],
    ["bold", "italic", "underline", "strike"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["blockquote", "code-block"],
    ["clean"],
  ],
};
const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "blockquote",
  "code-block",
];

export default function WeekJournalModal({
  isOpen,
  onClose,
  weekNumber,
  isLoading = false,
  availableProblems,
  availableProjects,
  fetchedNotes,
  onSave,
}: WeekJournalModalProps) {
  const [activeTab, setActiveTab] = useState<string>("general");
  const [contentMap, setContentMap] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const newMap: Record<string, string> = {};

      const generalNote = fetchedNotes.find(
        (n) => !n.internshipProblemId && !n.internshipProjectId
      );
      newMap["general"] = generalNote?.content || "";

      availableProjects.forEach((proj) => {
        const note = fetchedNotes.find(
          (n) => n.internshipProjectId === proj.id
        );
        newMap[`project-${proj.id}`] = note?.content || "";
      });

      availableProblems.forEach((prob) => {
        const note = fetchedNotes.find(
          (n) => n.internshipProblemId === prob.id
        );
        newMap[`problem-${prob.id}`] = note?.content || "";
      });

      setContentMap(newMap);
    }
  }, [isOpen, fetchedNotes, availableProblems, availableProjects]);

  const handleSaveCurrent = async () => {
    setIsSaving(true);
    const currentContent = contentMap[activeTab] || "";

    try {
      let type: "general" | "problem" | "project" = "general";
      let entityId = undefined;

      if (activeTab.startsWith("problem-")) {
        type = "problem";
        entityId = activeTab.replace("problem-", "");
      } else if (activeTab.startsWith("project-")) {
        type = "project";
        entityId = activeTab.replace("project-", "");
      }

      await onSave(currentContent, type, entityId);
    } catch (error) {
      console.error("Failed to save", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditorChange = (val: string) => {
    setContentMap((prev) => ({
      ...prev,
      [activeTab]: val,
    }));
  };

  if (!isOpen) return null;

  const getHeaderTitle = () => {
    if (activeTab === "general") return `Week ${weekNumber} - General Overview`;
    if (activeTab.startsWith("project-")) {
      const id = activeTab.replace("project-", "");
      const proj = availableProjects.find((p) => p.id === id);
      return proj ? `Project Note: ${proj.title}` : "Project Note";
    }
    if (activeTab.startsWith("problem-")) {
      const id = activeTab.replace("problem-", "");
      const prob = availableProblems.find((p) => p.id === id);
      return prob ? `Problem Note: ${prob.title}` : "Problem Note";
    }
    return "Note";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-6xl flex h-[85vh] overflow-hidden border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {}
        <div className="w-64 md:w-72 bg-gray-50 border-r border-gray-200 flex flex-col shrink-0">
          {}
          <div className="h-16 flex items-center px-4 border-b border-gray-200 bg-gray-100">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <BookOpen className="w-4 h-4" /> Notebook
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-6">
            <div>
              <div
                onClick={() => setActiveTab("general")}
                className={`
                   cursor-pointer px-3 py-2 rounded-lg flex items-center gap-3 text-sm font-medium transition-colors
                   ${
                     activeTab === "general"
                       ? "bg-white shadow-sm text-orange-600 border border-gray-200"
                       : "text-gray-600 hover:bg-gray-200/50"
                   }
                 `}
              >
                <FileText className="w-4 h-4" />
                General Overview
              </div>
            </div>

            {availableProjects.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">
                  Projects
                </h4>
                <div className="space-y-1">
                  {availableProjects.map((proj) => (
                    <div
                      key={proj.id}
                      onClick={() => setActiveTab(`project-${proj.id}`)}
                      className={`
                        cursor-pointer px-3 py-2 rounded-lg flex items-center gap-3 text-sm transition-colors
                        ${
                          activeTab === `project-${proj.id}`
                            ? "bg-white shadow-sm text-orange-600 border border-gray-200 font-medium"
                            : "text-gray-600 hover:bg-gray-200/50"
                        }
                      `}
                    >
                      <FolderGit2 className="w-4 h-4 shrink-0" />
                      <span className="truncate">{proj.title}</span>
                      {contentMap[`project-${proj.id}`]?.length > 20 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 ml-auto"></span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {availableProblems.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">
                  Problems
                </h4>
                <div className="space-y-1">
                  {availableProblems.map((prob) => (
                    <div
                      key={prob.id}
                      onClick={() => setActiveTab(`problem-${prob.id}`)}
                      className={`
                        cursor-pointer px-3 py-2 rounded-lg flex items-center gap-3 text-sm transition-colors
                        ${
                          activeTab === `problem-${prob.id}`
                            ? "bg-white shadow-sm text-orange-600 border border-gray-200 font-medium"
                            : "text-gray-600 hover:bg-gray-200/50"
                        }
                      `}
                    >
                      <Code className="w-4 h-4 shrink-0" />
                      <span className="truncate">{prob.title}</span>
                      {contentMap[`problem-${prob.id}`]?.length > 20 && (
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 ml-auto"></span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {}
        <div className="flex-1 flex flex-col min-w-0 bg-white relative">
          {}
          {isLoading && (
            <div className="absolute inset-0 z-20 bg-white/80 backdrop-blur-sm flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
                <span className="text-sm font-medium text-gray-600">
                  Loading notes...
                </span>
              </div>
            </div>
          )}

          {}
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 truncate pr-4">
              {getHeaderTitle()}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-hidden flex flex-col relative">
            <div className="absolute inset-0 p-6 overflow-y-auto">
              <ReactQuill
                key={activeTab}
                theme="snow"
                value={contentMap[activeTab] || ""}
                onChange={handleEditorChange}
                modules={modules}
                formats={formats}
                placeholder="Write your learnings here..."
                className="h-[calc(100%-3rem)]"
              />
            </div>
          </div>

          <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 z-10">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Close
            </button>
            <button
              onClick={handleSaveCurrent}
              disabled={isSaving || isLoading}
              className="px-6 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 rounded-lg flex items-center gap-2 transition-all shadow-sm"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save {activeTab === "general" ? "Note" : "Selection"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
