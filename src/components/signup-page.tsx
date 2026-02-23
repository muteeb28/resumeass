"use client";
import { BackgroundRippleLayout } from "./background-ripple-layout";
import { Navbar } from "./navbar";
import SignupForm from "./signup-form";

export default function SignupPage() {
  return (
    <BackgroundRippleLayout tone="light" contentClassName="min-h-screen">
      <Navbar tone="light" />
      <main className="flex min-h-screen items-center justify-center px-4 pt-16">
        <SignupForm />
      </main>
    </BackgroundRippleLayout>
  );
}
