import UploadProjectForm from "@/app/components/admin/uploadProjectForm";
import { createClient } from "@/app/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function UploadProjectsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const isAdmin = user.email === "anilcodes01@gmail.com";

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#ffffff] text-white">
        <h1 className="text-3xl font-bold text-red-500">Access Denied</h1>
        <p className="mt-4 text-gray-400">
          You do not have permission to view this page.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#ffffff] text-white p-4">
      <div className="w-full max-w-4xl">
        <h1 className="text-4xl font-bold text-center mb-8">
          Admin Project Upload
        </h1>
        <p className="text-center text-gray-400 mb-8">
          Use this form to add new projects with cover images to the platform.
        </p>
        <UploadProjectForm />
      </div>
    </div>
  );
}
