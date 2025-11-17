"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const toastId = toast.loading("Logging in...");

    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to log in.");
      }

      toast.success("Logged in successfully!", { id: toastId });

      router.push("/");
      router.refresh();
    } catch (error: unknown) {
      let errorMessage = "An unexpected error occurred.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#ffffff] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
          <p className="mt-2 text-gray-400">Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="peer w-full rounded-md border border-gray-600 bg-transparent px-4 py-2 text-white placeholder-transparent focus:border-green-500 focus:outline-none"
              placeholder="Email"
              disabled={isSubmitting}
            />
            <label
              htmlFor="email"
              className="absolute -top-3.5 left-3 bg-[#ffffff] px-1 text-sm text-gray-400 transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-green-500"
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
              className="peer w-full rounded-md border border-gray-600 bg-transparent px-4 py-2 text-white placeholder-transparent focus:border-green-500 focus:outline-none"
              placeholder="Password"
              disabled={isSubmitting}
            />
            <label
              htmlFor="password"
              className="absolute -top-3.5 left-3 bg-[#ffffff] px-1 text-sm text-gray-400 transition-all peer-placeholder-shown:top-2 peer-placeholder-shown:text-base peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-green-500"
            >
              Password
            </label>
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-green-600 py-2.5 cursor-pointer font-semibold text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-[#ffffff] disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-400">
          Don’t have an account?{" "}
          <a
            href="/signup"
            className="font-medium text-green-500 hover:underline"
          >
            Sign Up
          </a>
        </p>
      </div>
    </div>
  );
}
