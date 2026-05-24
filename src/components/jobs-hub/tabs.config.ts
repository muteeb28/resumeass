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
}

export const TABS: TabConfig[] = [
  {
    id: "jobs",
    label: "Find Jobs",
    region: "India",
    dataStatus: "live",
    description: "Fresh job listings updated every 48 hours",
    feedType: "jobs",
  },
  {
    id: "tracker",
    label: "Job Tracker",
    region: "Workspace",
    dataStatus: "live",
    description: "Track stages, export to Sheets, and manage every application",
    feedType: "jobs",
  },
  {
    id: "emails",
    label: "HR Emails",
    region: "India",
    dataStatus: "live",
    description: "HR recruiter contacts for direct outreach",
    feedType: "contacts",
  },
  {
    id: "dubai-hr",
    label: "Dubai HR",
    region: "UAE",
    dataStatus: "live",
    description: "UAE-based HR recruiters and hiring contacts",
    feedType: "contacts",
  },
  {
    id: "gulf-jobs",
    label: "Gulf Jobs",
    region: "GCC",
    dataStatus: "empty",
    description: "Job listings across Saudi Arabia, UAE, Qatar, and Kuwait",
    feedType: "jobs",
  },
  {
    id: "au-nz",
    label: "AU & NZ",
    region: "AU/NZ",
    dataStatus: "empty",
    description: "Tech and professional roles across Australia and New Zealand",
    feedType: "jobs",
  },
];
