export type TabId =
  | "jobs"
  | "tracker"
  | "emails"
  | "dubai-hr"
  | "gulf-jobs"
  | "au-nz";

export type DataStatus = "live" | "empty";

export interface TabConfig {
  id: TabId;
  label: string;
  region: string;
  dataStatus: DataStatus;
  description: string;
  feedType: "jobs" | "contacts";
  path: string;
}

export const TABS: TabConfig[] = [
  {
    id: "jobs",
    label: "Find Jobs",
    region: "India",
    dataStatus: "live",
    description: "Fresh job listings updated every 48 hours",
    feedType: "jobs",
    path: "/find-jobs",
  },
  {
    id: "tracker",
    label: "Job Tracker",
    region: "Workspace",
    dataStatus: "live",
    description: "Track stages, export to Sheets, and manage every application",
    feedType: "jobs",
    path: "/job-tracker",
  },
  {
    id: "emails",
    label: "HR Emails",
    region: "India",
    dataStatus: "live",
    description: "HR recruiter contacts for direct outreach",
    feedType: "contacts",
    path: "/hr-emails",
  },
  {
    id: "dubai-hr",
    label: "Dubai HR",
    region: "UAE",
    dataStatus: "live",
    description: "UAE-based HR recruiters and hiring contacts",
    feedType: "contacts",
    path: "/dubai-hr",
  },
  {
    id: "gulf-jobs",
    label: "Gulf Jobs",
    region: "GCC",
    dataStatus: "empty",
    description: "Job listings across Saudi Arabia, UAE, Qatar, and Kuwait",
    feedType: "jobs",
    path: "/gulf-jobs",
  },
  {
    id: "au-nz",
    label: "AU & NZ",
    region: "AU/NZ",
    dataStatus: "empty",
    description: "Tech and professional roles across Australia and New Zealand",
    feedType: "jobs",
    path: "/au-nz",
  },
];
