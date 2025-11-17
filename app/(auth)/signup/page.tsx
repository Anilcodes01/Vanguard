"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const toastId = toast.loading("Creating your account...");

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      toast.success(data.message || "Account created successfully!", {
        id: toastId,
      });

      router.refresh();
      router.push("/onboarding");
    } catch (error: unknown) {
      let errorMessage = "An unexpected error occurred.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage, {
        id: toastId,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#ffffff] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-black">Create an Account</h1>
          <p className="mt-2 text-gray-400">Join us and start your journey</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ... your form inputs remain the same ... */}
          <div className="relative">
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
              className="peer w-full rounded-md border border-gray-600 bg-transparent px-4 py-2 text-black placeholder-transparent focus:border-orange-500 focus:outline-none"
              placeholder="Full Name"
              disabled={isSubmitting}
            />
            <label
              htmlFor="name"
              className="absolute -top-3.5 left-3 bg-[#ffffff] px-1 text-sm text-gray-400 transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-orange-500"
            >
              Full Name
            </label>
          </div>

          <div className="relative">
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              className="peer w-full rounded-md border border-gray-600 bg-transparent px-4 py-2 text-black placeholder-transparent focus:border-orange-500 focus:outline-none"
              placeholder="Username"
              disabled={isSubmitting}
            />
            <label
              htmlFor="username"
              className="absolute -top-3.5 left-3 bg-[#ffffff] px-1 text-sm text-gray-400 transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-orange-500"
            >
              Username
            </label>
          </div>

          <div className="relative">
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="peer w-full rounded-md border border-gray-600 bg-transparent px-4 py-2 text-black placeholder-transparent focus:border-orange-500 focus:outline-none"
              placeholder="Email"
              disabled={isSubmitting}
            />
            <label
              htmlFor="email"
              className="absolute -top-3.5 left-3 bg-[#ffffff] px-1 text-sm text-gray-400 transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-orange-500"
            >
              Email
            </label>
          </div>

          <div className="relative">
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              className="peer w-full rounded-md border border-gray-600 bg-transparent px-4 py-2 text-black placeholder-transparent focus:border-orange-500 focus:outline-none"
              placeholder="Password"
              disabled={isSubmitting}
            />
            <label
              htmlFor="password"
              className="absolute -top-3.5 left-3 bg-[#ffffff] px-1 text-sm text-gray-400 transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-orange-500"
            >
              Password
            </label>
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-orange-600 py-2.5 cursor-pointer font-semibold text-black transition-colors hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-[#ffffff] disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <a
            href="/login"
            className="font-medium text-orange-500 hover:underline"
          >
            Log In
          </a>
        </p>
      </div>
    </div>
  );
}