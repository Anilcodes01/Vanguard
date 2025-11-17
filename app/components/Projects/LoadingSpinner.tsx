import { Loader2 } from "lucide-react";

export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center min-h-screen bg-[#ffffff] text-white">
      <Loader2 className="w-10 h-10 animate-spin" />
    </div>
  );
}
