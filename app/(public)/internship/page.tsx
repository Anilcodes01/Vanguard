import Enrolled from "@/app/components/internship/Enrolled";
import NotEnrolled from "@/app/components/internship/NotEnrolled";
import TextArea from "@/app/components/internship/TextArea";
import { createClient } from "@/app/utils/supabase/server";
import { prisma } from "@/lib/prisma";

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
    },
  });

  if (userEnrollmentData?.internship_enrolled) {
    return <Enrolled />;
  } else {
    return <NotEnrolled />;
  }
}
