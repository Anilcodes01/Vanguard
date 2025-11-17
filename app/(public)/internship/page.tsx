import NotEnrolled from "@/app/components/internship/NotEnrolled";
import { createClient } from "@/app/utils/supabase/server";
import { prisma } from "@/lib/prisma";

import EnrolledUI from "@/app/components/internship/enrolled/EnrolledUI";

export default async function InternshipPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <NotEnrolled />;
  }

  const userEnrollmentData = await prisma.profiles.findUnique({
    where: {
      id: user?.id,
    },
    select: {
      internship_enrolled: true,
      name: true,
    },
  });

  if (userEnrollmentData?.internship_enrolled) {
    return (
      <div className="relative flex flex-col items-center justify-center min-h-screen  p-4">
        <EnrolledUI userName={userEnrollmentData.name || "Student"} />
      </div>
    );
  } else {
    return <NotEnrolled />;
  }
}
