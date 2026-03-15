"use client";
import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useUserStore } from "../stores/useUserStore";
import { useRouter } from "next/navigation";
import { LoaderFive } from "@/components/ui/loader";

export default function SignupFormDemo() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { loading } = useUserStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // const result = await login(email, password);
    // if (result?.success) {
    //   router.push("/");
    // }
  };

  return (
    <div className="mx-auto w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-4 shadow-lg md:p-8">
      <h2 className="text-xl font-bold text-neutral-800">
        Welcome back
      </h2>
      <p className="mt-2 max-w-sm text-sm text-neutral-500">
        Log in to ResumeAssist AI to continue.
      </p>

      <form className="my-8" onSubmit={handleSubmit}>
        <LabelInputContainer className="mb-4">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            placeholder="name@company.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </LabelInputContainer>
        <LabelInputContainer className="mb-8">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            placeholder="********"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </LabelInputContainer>

        <button
          className="group/btn relative block h-10 w-full rounded-md bg-neutral-900 font-medium text-white hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          type="submit"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <LoaderFive text="" size="sm" className="gap-0" />
            </div>
          ) : (
            <>
              Log in →
              <BottomGradient />
            </>
          )}
        </button>

        <p className="mt-4 text-center text-sm text-neutral-500">
          Don't have an account?{" "}
          <a href="/signup" className="text-blue-500 hover:underline">
            Sign up
          </a>
        </p>
      </form>
    </div>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex w-full flex-col space-y-2", className)}>
      {children}
    </div>
  );
};
