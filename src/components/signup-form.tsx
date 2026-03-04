"use client";
import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { LoaderFive } from "@/components/ui/loader";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useUserStore } from "../stores/useUserStore";

type GoalOption = {
  id: "perfect_resume" | "find_jobs" | "hr_emails" | "others";
  label: string;
  aiTag?: boolean;
};

const STEP_TITLES = ["Profile", "Target Role", "Main Goal", "Complete Signup"];

const DESIGNATION_OPTIONS = [
  "Full Stack Developer",
  "Frontend Developer",
  "Backend Developer",
  "Mobile Developer",
  "Data Analyst",
  "Product Manager",
  "UI/UX Designer",
];

const EXPERIENCE_OPTIONS = [
  "0-1 years",
  "1-3 years",
  "3-5 years",
  "5-8 years",
  "8-12 years",
  "12+ years",
];

const COMPANY_TYPE_OPTIONS = [
  "Startup",
  "Mid-size Product Company",
  "Enterprise",
  "Service-Based Company",
  "Remote-First Company",
];

const GOAL_OPTIONS: GoalOption[] = [
  { id: "perfect_resume", label: "Create the perfect resume", aiTag: true },
  { id: "find_jobs", label: "Find relevant jobs" },
  { id: "hr_emails", label: "Get HR emails directly" },
  { id: "others", label: "Others" },
];

export default function SignupForm() {
  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [currentDesignation, setCurrentDesignation] = useState("");
  const [currentCompany, setCurrentCompany] = useState("");
  const [experience, setExperience] = useState("");
  const [desiredDesignation, setDesiredDesignation] = useState("");
  const [companyType, setCompanyType] = useState("");
  const [goals, setGoals] = useState<GoalOption["id"][]>([]);
  const [otherGoalText, setOtherGoalText] = useState("");
  const [linkedInUrl, setLinkedInUrl] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { signup, loading } = useUserStore();
  const router = useRouter();

  const stepErrors = useMemo(() => {
    if (step === 1) {
      if (
        !fullName.trim() ||
        !email.trim() ||
        !currentDesignation ||
        !currentCompany.trim() ||
        !experience
      ) {
        return "Please fill all fields in screen 1.";
      }
    }

    if (step === 2) {
      if (!desiredDesignation.trim() || !companyType) {
        return "Please fill all fields in screen 2.";
      }
    }

    if (step === 3) {
      if (goals.length === 0) {
        return "Please select at least one goal.";
      }
      if (goals.includes("others") && !otherGoalText.trim()) {
        return "Please describe your goal in Others.";
      }
    }

    if (step === 4) {
      if (!linkedInUrl.trim() || !password || !confirmPassword) {
        return "Please complete all fields in screen 4.";
      }
    }

    return "";
  }, [
    step,
    fullName,
    email,
    currentDesignation,
    currentCompany,
    experience,
    desiredDesignation,
    companyType,
    goals,
    otherGoalText,
    linkedInUrl,
    resumeFile,
    password,
    confirmPassword,
  ]);

  const onNext = () => {
    if (stepErrors) {
      toast.error(stepErrors);
      return;
    }
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const onBack = () => setStep((prev) => Math.max(prev - 1, 1));

  const toggleGoal = (goal: GoalOption["id"]) => {
    setGoals((prev) =>
      prev.includes(goal) ? prev.filter((item) => item !== goal) : [...prev, goal]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (stepErrors) {
      toast.error(stepErrors);
      return;
    }

    const result = await signup({
      username: fullName.trim(),
      email: email.trim(),
      currentDesignation,
      currentCompany,
      experience,
      desiredDesignation,
      companyType,
      goals,
      otherGoal: otherGoalText,
      linkedinUrl: linkedInUrl,
      password,
      confirmPassword,
    });

    if (result?.success) {
      router.push("/");
    }
  };

  return (
    <div className="mx-auto w-full max-w-2xl rounded-2xl border border-neutral-200 bg-white p-4 shadow-lg md:p-8">
      <h2 className="text-xl font-bold text-neutral-800">Create your account</h2>
      <p className="mt-2 text-sm text-neutral-500">
        Complete all 4 screens to finish signup.
      </p>

      <div className="mt-6 grid grid-cols-4 gap-2 md:gap-3">
        {STEP_TITLES.map((title, index) => {
          const stepNumber = index + 1;
          const isActive = step === stepNumber;
          const isCompleted = step > stepNumber;

          return (
            <div key={title} className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold",
                  isCompleted && "border-neutral-900 bg-neutral-900 text-white",
                  isActive && "border-neutral-900 text-neutral-900",
                  !isActive && !isCompleted && "border-neutral-300 text-neutral-400"
                )}
              >
                {stepNumber}
              </div>
              <span
                className={cn(
                  "text-center text-[11px] md:text-xs",
                  isActive || isCompleted ? "text-neutral-700" : "text-neutral-400"
                )}
              >
                {title}
              </span>
            </div>
          );
        })}
      </div>

      <form className="mt-8" onSubmit={handleSubmit}>
        {step === 1 && (
          <div className="space-y-4">
            <LabelInputContainer>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label>Current Designation</Label>
              <Select value={currentDesignation} onValueChange={setCurrentDesignation}>
                <SelectTrigger className="h-10 w-full rounded-lg border-neutral-200">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  {DESIGNATION_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="currentCompany">Current Company</Label>
              <Input
                id="currentCompany"
                placeholder="Company name"
                value={currentCompany}
                onChange={(e) => setCurrentCompany(e.target.value)}
                required
              />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label>Years of Experience</Label>
              <Select value={experience} onValueChange={setExperience}>
                <SelectTrigger className="h-10 w-full rounded-lg border-neutral-200">
                  <SelectValue placeholder="Select experience" />
                </SelectTrigger>
                <SelectContent>
                  {EXPERIENCE_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </LabelInputContainer>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-neutral-800">
              What kind of role are you aiming for
            </h3>
            <LabelInputContainer>
              <Label htmlFor="desiredDesignation">Desired Designation</Label>
              <Input
                id="desiredDesignation"
                placeholder="Senior Full Stack Developer"
                value={desiredDesignation}
                onChange={(e) => setDesiredDesignation(e.target.value)}
                required
              />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label>Company Type</Label>
              <Select value={companyType} onValueChange={setCompanyType}>
                <SelectTrigger className="h-10 w-full rounded-lg border-neutral-200">
                  <SelectValue placeholder="Select company type" />
                </SelectTrigger>
                <SelectContent>
                  {COMPANY_TYPE_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </LabelInputContainer>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-neutral-800">What&apos;s your main goal</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {GOAL_OPTIONS.map((option) => {
                const selected = goals.includes(option.id);
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => toggleGoal(option.id)}
                    className={cn(
                      "flex min-h-20 items-center justify-between rounded-lg border p-4 text-left transition",
                      selected
                        ? "border-neutral-900 bg-neutral-100"
                        : "border-neutral-200 hover:border-neutral-400"
                    )}
                  >
                    <span className="text-sm font-medium text-neutral-800">{option.label}</span>
                    {option.aiTag && <Badge className="bg-cyan-600 text-white">AI</Badge>}
                  </button>
                );
              })}
            </div>

            {goals.includes("others") && (
              <LabelInputContainer>
                <Label htmlFor="otherGoalText">Others</Label>
                <Input
                  id="otherGoalText"
                  placeholder="Type your goal"
                  value={otherGoalText}
                  onChange={(e) => setOtherGoalText(e.target.value)}
                  required
                />
              </LabelInputContainer>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-neutral-800">Let&apos;s complete your signup</h3>
            <LabelInputContainer>
              <Label htmlFor="linkedInUrl">Linked URL</Label>
              <Input
                id="linkedInUrl"
                type="url"
                placeholder="https://www.linkedin.com/in/username"
                value={linkedInUrl}
                onChange={(e) => setLinkedInUrl(e.target.value)}
                required
              />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </LabelInputContainer>
            <LabelInputContainer>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </LabelInputContainer>
          </div>
        )}

        <div className="mt-8 flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={step === 1 || loading}
            className="min-w-24"
          >
            Back
          </Button>

          {step < 4 ? (
            <Button type="button" onClick={onNext} className="min-w-24">
              Next
            </Button>
          ) : (
            <Button type="submit" disabled={loading} className="min-w-28">
              {loading ? (
                <span className="flex items-center justify-center">
                  <LoaderFive text="" size="sm" className="gap-0" />
                </span>
              ) : (
                "Sign up"
              )}
            </Button>
          )}
        </div>

        <p className="mt-4 text-center text-sm text-neutral-500">
          Already have an account?{" "}
          <a href="/login" className="text-blue-500 hover:underline">
            Log in
          </a>
        </p>
      </form>
    </div>
  );
}

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return <div className={cn("flex w-full flex-col space-y-2", className)}>{children}</div>;
};
