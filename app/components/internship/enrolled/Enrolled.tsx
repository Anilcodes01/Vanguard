import { createClient } from "@/app/utils/supabase/server";
import NotEnrolled from "../NotEnrolled";
import EnrolledUI from "./EnrolledUI";

export default async function Enrolled() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <NotEnrolled />;
  }

  const userName = user.user_metadata.name || "Student";

  return <EnrolledUI userName={userName} />;
}
