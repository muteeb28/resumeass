import type { LucideIcon } from "lucide-react";
import { Briefcase, ClipboardList, Mail, Building2, Globe, Plane, BookOpen, GraduationCap } from "lucide-react";

export type NavDropdownLink = {
  name: string;
  href: string;
  description: string;
  icon: LucideIcon;
  external?: boolean;
};

export const JOB_LINKS: NavDropdownLink[] = [
  { name: "Find Jobs", href: "/find-jobs", description: "Browse fresh job openings.", icon: Briefcase },
  { name: "Job Tracker", href: "/job-tracker", description: "Track your applications.", icon: ClipboardList },
  { name: "HR Emails", href: "/hr-emails", description: "Find verified HR contacts.", icon: Mail },
  { name: "Dubai HR", href: "/dubai-hr", description: "UAE hiring contacts.", icon: Building2 },
  { name: "Gulf Jobs", href: "/gulf-jobs", description: "Gulf region opportunities.", icon: Globe },
  { name: "AU & NZ", href: "/au-nz", description: "Australia and New Zealand roles.", icon: Plane },
];

export const LEARN_LINKS: NavDropdownLink[] = [
  { name: "Courses", href: "/courses", description: "Video courses and learning paths.", icon: GraduationCap, external: true },
  { name: "Opportunities", href: "/opportunities", description: "Explore job and career opportunities.", icon: Briefcase, external: true },
  { name: "Prepare", href: "/prepare", description: "Practice problems and interview prep.", icon: ClipboardList, external: true },
  { name: "Interview Questions", href: "/interview-questions", description: "Practice company-wise interview questions.", icon: BookOpen, external: false },
];
