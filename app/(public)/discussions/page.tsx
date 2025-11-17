import { getDiscussionProjects } from "@/app/lib/discussions";
import DiscussionsList from "@/app/components/discussions/DiscussionsList";
import { Suspense } from "react";
import DiscussionsLoading from "./loading";

export default async function DiscussionsPage() {
  const projects = await getDiscussionProjects();

  return (
    <main className="min-h-screen bg-white p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-black mb-8 tracking-wider">
          Community Projects
        </h1>
        <Suspense fallback={<DiscussionsLoading />}>
          <DiscussionsList initialProjects={projects} />
        </Suspense>
      </div>
    </main>
  );
}