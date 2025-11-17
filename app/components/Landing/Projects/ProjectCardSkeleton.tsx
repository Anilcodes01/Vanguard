import React from "react";

const DailyChallengeSkeleton = () => (
  <div className="bg-white p-6 rounded-xl shadow-md animate-pulse">
    <div className="w-1/4 h-4 bg-gray-200 rounded mb-2"></div>
    <div className="w-1/2 h-7 bg-gray-200 rounded mb-4"></div>
    <div className="flex flex-wrap gap-2 mb-6">
      <div className="w-20 h-5 bg-gray-200 rounded-full"></div>
      <div className="w-16 h-5 bg-gray-200 rounded-full"></div>
      <div className="w-24 h-5 bg-gray-200 rounded-full"></div>
      <div className="w-32 h-5 bg-gray-200 rounded-full"></div>
    </div>
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-4">
        <div className="w-16 h-5 bg-gray-200 rounded-full"></div>
        <div className="w-20 h-5 bg-gray-200 rounded-full"></div>
        <div className="w-16 h-5 bg-gray-200 rounded-full"></div>
      </div>
      <div className="w-24 h-10 bg-gray-200 rounded-md"></div>
    </div>
  </div>
);

const InProgressProjectCardSkeleton = () => (
  <div className="bg-white p-6 rounded-xl shadow-md animate-pulse">
    <div className="w-3/4 h-6 bg-gray-200 rounded mb-3"></div>
    <div className="space-y-2 mb-4">
      <div className="w-full h-4 bg-gray-200 rounded"></div>
      <div className="w-5/6 h-4 bg-gray-200 rounded"></div>
    </div>
    <div className="w-32 h-6 bg-gray-200 rounded-full mb-6"></div>
    <div className="flex justify-between items-center">
      <div className="w-28 h-5 bg-gray-200 rounded-full"></div>
      <div className="w-32 h-10 bg-gray-200 rounded-md"></div>
    </div>
  </div>
);

const LeaderboardSkeleton = () => (
  <div className="bg-white min-h-screen p-6 rounded-xl shadow-md animate-pulse w-full">
    <div className="w-1/2 h-6 bg-gray-200 rounded mx-auto mb-8"></div>
    <div className="flex flex-col items-center text-center">
      <div className="w-16 h-16 bg-gray-200 rounded-full mb-4"></div>
      <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
    </div>
  </div>
);

export default function DashboardSkeleton() {
  return (
    <div className="flex justify-center min-h-screen w-full">
      <div className="bg-[#ffffff] max-w-7xl w-full text-black p-8">
        <div className="w-1/3 h-8 bg-gray-200  rounded animate-pulse mb-12"></div>

        <div className="grid grid-cols-1   lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-10">
            <DailyChallengeSkeleton />

            <div>
              <div className="w-1/4 h-7 bg-gray-200 rounded animate-pulse mb-6"></div>
              <div className="space-y-6">
                <InProgressProjectCardSkeleton />
                <InProgressProjectCardSkeleton />
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <LeaderboardSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}
