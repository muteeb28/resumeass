"use client";

import { cn } from "@/lib/utils";
import type { ResumeData, SectionType } from "@/types/portfolioly-resume";
import {
  User,
  Camera,
  Globe,
  Briefcase,
  Wrench,
  FolderKanban,
  GraduationCap,
  Award,
} from "lucide-react";

export interface SectionNavItem {
  id: SectionType | "profiles" | "photo";
  label: string;
  icon: React.ElementType;
}

export const navItems: SectionNavItem[] = [
  { id: "basics", label: "Personal Info", icon: User },
  { id: "photo", label: "Profile Photo", icon: Camera },
  { id: "profiles", label: "Social Links", icon: Globe },
  { id: "work", label: "Work Experience", icon: Briefcase },
  { id: "skills", label: "Skills", icon: Wrench },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "awards", label: "Awards", icon: Award },
];

function hasData(data: ResumeData, sectionId: string): boolean {
  switch (sectionId) {
    case "basics":
      return Boolean(data.basics?.name || data.basics?.email);
    case "photo":
      return Boolean(data.basics?.photo);
    case "profiles":
      return (data.basics?.profiles?.length ?? 0) > 0;
    case "work":
      return (data.work?.length ?? 0) > 0;
    case "skills":
      return (data.skills?.length ?? 0) > 0;
    case "projects":
      return (data.projects?.length ?? 0) > 0;
    case "education":
      return (data.education?.length ?? 0) > 0;
    case "awards":
      return (data.awards?.length ?? 0) > 0;
    default:
      return false;
  }
}

export interface NavigationSidebarProps {
  data: ResumeData;
  activeSection: string;
  onSelect: (id: string) => void;
}

export function NavigationSidebar({
  data,
  activeSection,
  onSelect,
}: NavigationSidebarProps) {
  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        const filled = hasData(data, item.id);
        const active = activeSection === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={cn(
              "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-left",
              active
                ? "bg-neutral-900 text-white"
                : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{item.label}</span>
            {filled && (
              <span
                className={cn(
                  "ml-auto h-2 w-2 shrink-0 rounded-full",
                  active ? "bg-white" : "bg-emerald-500",
                )}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
