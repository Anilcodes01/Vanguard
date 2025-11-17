import { PaperAirplaneIcon } from "@heroicons/react/24/solid";

interface EnrolledUIProps {
  userName: string;
}

export default function EnrolledTopUi({ userName }: EnrolledUIProps) {

    return (
          <div className="w-full max-w-4xl flex flex-col items-center justify-center gap-8 text-white">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">
          Welcome, {userName} 👋
        </h1>
        <p className="mt-2 text-lg text-gray-400">
          You&apos;re successfully enrolled! Your mentorship journey starts now.
        </p>
      </div>

      <div className="w-full  backdrop-blur-sm border  rounded-2xl shadow-lg p-2 flex items-center gap-2 focus-within:ring-2 focus-within:ring-green-500 transition-all duration-300">
        <textarea
          placeholder="Ask your mentor anything..."
          rows={1}
          className="flex-grow bg-transparent text-base text-black placeholder-gray-500 resize-none outline-none p-3 max-h-48"
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = "auto";
            target.style.height = `${target.scrollHeight}px`;
          }}
        />
        <button
          aria-label="Send message"
          className="flex items-center justify-center w-12 h-12 bg-green-600 rounded-xl hover:bg-green-700 active:scale-95 transition-all duration-200 disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          <PaperAirplaneIcon className="w-6 h-6 text-white" />
        </button>
      </div>

      <div className="flex flex-wrap justify-center gap-3 text-sm">
        <button className=" border  px-4 py-2 hover:text-black text-black rounded-full  transition-colors">
          Review my project plan
        </button>
        <button className=" border px-4 py-2 rounded-full text-black transition-colors">
          Suggest a learning path
        </button>
        <button className=" border  px-4 py-2 rounded-full text-black transition-colors">
          Explain a concept
        </button>
      </div>

       
    </div>
    )
}