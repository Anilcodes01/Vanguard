import FullProjectCardSkeleton from "@/app/components/Landing/Projects/ProjectCardSkeleton";

export default function Loading() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#ffffff]">
      <FullProjectCardSkeleton />
    </div>
  );
}
