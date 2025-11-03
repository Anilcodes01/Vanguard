import { ProjectSubmission, Comment } from "@/types";
import {
  ArrowBigUp,
  CornerDownRight,
  Github,
  Link as LinkIcon,
  Loader2,
  MessageCircle,
  Send,
  Smile,
} from "lucide-react";
import Image from "next/image";
import { useState, FormEvent, useRef, useEffect } from "react";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";

function CommentForm({
  projectId,
  parentId,
  onCommentSubmitted,
}: {
  projectId: string;
  parentId?: string;
  onCommentSubmitted: (newComment: Comment) => void;
}) {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setText((prevText) => prevText + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [pickerRef]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/discussions/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submittedProjectId: projectId,
          text,
          parentId,
        }),
      });
      const newComment = await response.json();
      if (response.ok) {
        onCommentSubmitted(newComment);
        setText("");
      }
    } catch (error) {
      console.error("Failed to post comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 relative">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={parentId ? "Write a reply..." : "Add a comment..."}
        className="block w-full rounded-md border-0 bg-[#222] py-2 pl-3 pr-10 text-white placeholder:text-neutral-500"
      />

      <div className="absolute right-12 top-1/2 -translate-y-1/2">
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        >
          <Smile className="h-5 w-5 text-neutral-400 hover:text-white" />
        </button>
        {showEmojiPicker && (
          <div
            ref={pickerRef}
            className="absolute bottom-full right-0 z-10 mb-2"
          >
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              theme={Theme.DARK}
              height={350}
              width={300}
            />
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !text.trim()}
        className="p-2 rounded-md bg-green-600 text-white disabled:opacity-50"
      >
        {isSubmitting ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Send className="w-5 h-5" />
        )}
      </button>
    </form>
  );
}

function CommentWithReplies({
  comment,
  projectId,
  onNewComment,
}: {
  comment: Comment;
  projectId: string;
  onNewComment: (projectId: string, newComment: Comment) => void;
}) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const userProfile = comment.user.profiles?.[0];

  return (
    <div>
      <div className="flex items-start gap-3">
        <Image
          src={userProfile?.avatar_url || "/user.png"}
          alt={userProfile?.name || "User"}
          width={32}
          height={32}
          className="rounded-full mt-1 h-8 w-8"
        />
        <div className="bg-neutral-700 rounded-lg p-3 w-full">
          <p className="text-sm font-semibold text-white">
            {userProfile?.name || userProfile?.username || "Anonymous"}
          </p>
          <p className="text-sm text-neutral-300">{comment.text}</p>
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="text-xs text-neutral-400 hover:text-white mt-2 flex items-center gap-1"
          >
            <CornerDownRight className="w-3 h-3" /> Reply
          </button>
        </div>
      </div>
      <div className="pl-5 border-l-2 border-neutral-700 ml-4 mt-4 space-y-4">
        {showReplyForm && (
          <CommentForm
            projectId={projectId}
            parentId={comment.id}
            onCommentSubmitted={(newComment) => {
              onNewComment(projectId, newComment);
              setShowReplyForm(false);
            }}
          />
        )}
        {comment.replies?.map((reply) => (
          <CommentWithReplies
            key={reply.id}
            comment={reply}
            projectId={projectId}
            onNewComment={onNewComment}
          />
        ))}
      </div>
    </div>
  );
}

function CommentSection({
  project,
  onNewComment,
}: {
  project: ProjectSubmission;
  onNewComment: (projectId: string, newComment: Comment) => void;
}) {
  return (
    <div className="mt-4 pt-4 border-t border-neutral-700">
      <h3 className="text-lg font-semibold text-white mb-4">Discussion</h3>
      <CommentForm
        projectId={project.id}
        onCommentSubmitted={(newComment) =>
          onNewComment(project.id, newComment)
        }
      />
      <div className="space-y-4 mt-4">
        {project.comments.map((comment) => (
          <CommentWithReplies
            key={comment.id}
            comment={comment}
            projectId={project.id}
            onNewComment={onNewComment}
          />
        ))}
      </div>
    </div>
  );
}

export default function ProjectCard({
  project,
  onUpvote,
  onNewComment,
}: {
  project: ProjectSubmission;
  onUpvote: () => void;
  onNewComment: (projectId: string, newComment: Comment) => void;
}) {
  const [showComments, setShowComments] = useState(false);
  const userProfile = project.user.profiles?.[0];

  return (
    <div className="bg-[#333] border border-neutral-700 rounded-lg p-6">
      <div className="flex items-start gap-4 mb-4">
        <Image
          src={userProfile?.avatar_url || "/user.png"}
          alt={userProfile?.name || userProfile?.username || "User"}
          width={40}
          height={40}
          className="rounded-full h-12 w-12"
        />
        <div>
          <h2 className="text-xl font-bold text-white">
            {project.project.name}
          </h2>
          <p className="text-sm text-neutral-400">
            Submitted by{" "}
            {userProfile?.name || userProfile?.username || "Anonymous"}
          </p>
        </div>
      </div>

      {project.description && (
        <p className="text-neutral-300 mb-4 whitespace-pre-wrap">
          {project.description}
        </p>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        {project.builtWith.map((tech) => (
          <span
            key={tech}
            className="bg-neutral-700 text-xs text-neutral-200 px-2 py-1 rounded"
          >
            {tech}
          </span>
        ))}
      </div>

      <div className="flex items-center gap-4 text-neutral-400 mb-6">
        {project.githubUrl && (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <Github className="w-4 h-4" /> GitHub
          </a>
        )}
        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <LinkIcon className="w-4 h-4" /> Live Demo
          </a>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-neutral-700 pt-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onUpvote}
            className="flex items-center gap-2 text-neutral-300 hover:text-white transition-colors"
          >
            <ArrowBigUp
              className={`w-6 h-6 ${
                project.hasUpvoted ? "text-green-500 fill-current" : ""
              }`}
            />
            {project.upvotesCount}
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 text-neutral-300 hover:text-white transition-colors"
          >
            <MessageCircle className="w-5 h-5" /> {project.commentsCount}
          </button>
        </div>
      </div>

      {showComments && (
        <CommentSection project={project} onNewComment={onNewComment} />
      )}
    </div>
  );
}
