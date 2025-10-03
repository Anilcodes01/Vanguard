"use client";

import { useRouter } from "next/navigation";

export default  function UsernotLoggedInLanding() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white text-black">
      <h1>Please Login in to continue.</h1>
      <button
        className="px-4 py-2 rounded-2xl bg-green-400 cursor-pointer"
        onClick={() => {
          router.push("/login");
        }}
      >
        Login
      </button>
    </div>
  );
}
