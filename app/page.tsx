import { createClient } from './utils/supabase/server';
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function UserDashboard() {
  const supabase =await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return <div>Please log in.</div>;
  }

  const userProfile = await prisma.profiles.findUnique({
    where: { id: user.id },
  });

  return (
    <div>
      <h1>Welcome, {userProfile?.name}!</h1>
      <h2>Your username is, {userProfile?.username}</h2>

      <p>Your email is: {user.email}</p>
    </div>
  );
}