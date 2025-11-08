import FullProjectCardSkeleton from '@/app/components/Landing/Projects/ProjectCardSkeleton'

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#262626]">
     <FullProjectCardSkeleton />
    </div>
  );
}