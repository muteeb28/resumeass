"use client";

import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { 
  CalendarIcon, 
  X, 
  Plus, 
  Save, 
  Trash2, 
  Edit3, 
  Building2, 
  Briefcase, 
  MapPin, 
  DollarSign, 
  ExternalLink, 
  User, 
  ChevronDown, 
  Check, 
  Sparkles,
  Link2,
  FileText,
  UserCheck
} from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { useUserStore } from "@/stores/useUserStore";
import axiosInstance from "@/lib/axios";

/**
 * TYPES & VISUAL CONSTANTS
 */
type ApplicationStatus = "Offer" | "Rejected" | "Interview" | "Applied";

type EditableField =
  | "company" | "title" | "link" | "contact" | "date" | "stage"
  | "salary" | "location" | "priority" | "referral" | "notes";

type JobApplicationRow = {
  _id?: string;
  tempId?: string;
  company: string;
  title: string;
  status: ApplicationStatus;
  link: string;
  contact: string;
  date: string;
  stage: string;
  salary: string;
  location: string;
  priority: string;
  referral: string;
  notes: string;
  isDraft?: boolean;
  isSaving?: boolean;
};

const STATUS_THEMES: Record<ApplicationStatus, { label: string; bg: string; dot: string; text: string; hover: string }> = {
  Applied: { label: "Applied", bg: "bg-blue-50/70 border-blue-100", dot: "bg-blue-500", text: "text-blue-700", hover: "hover:bg-blue-100/50" },
  Interview: { label: "Interview", bg: "bg-amber-50/70 border-amber-100", dot: "bg-amber-500", text: "text-amber-700", hover: "hover:bg-amber-100/50" },
  Offer: { label: "Offer", bg: "bg-emerald-50/70 border-emerald-100", dot: "bg-emerald-500", text: "text-emerald-700", hover: "hover:bg-emerald-100/50" },
  Rejected: { label: "Archived", bg: "bg-rose-50/70 border-rose-100", dot: "bg-rose-500", text: "text-rose-600", hover: "hover:bg-rose-100/50" },
};

const PRIORITY_THEMES: Record<string, string> = {
  High: "bg-rose-50 text-rose-700 border-rose-100",
  Medium: "bg-indigo-50 text-indigo-700 border-indigo-100",
  Low: "bg-slate-50 text-slate-600 border-slate-200",
};

/**
 * HELPERS
 */
const createId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

const getRowKey = (row: JobApplicationRow) => row._id || row.tempId || createId("row");

const normalizeFetchedRow = (row: any): JobApplicationRow => ({
  _id: String(row?._id || row?.id || ""),
  company: row?.company || "",
  title: row?.title || "",
  status: (row?.status || "Applied") as ApplicationStatus,
  link: row?.link || "",
  contact: row?.contact || "",
  date: row?.date || "",
  stage: row?.stage || "Initial Screening",
  salary: row?.salary || "",
  location: row?.location || "",
  priority: row?.priority || "Medium",
  referral: row?.referral || "none",
  notes: row?.notes || "",
});

const cleanApplicationPayload = (row: JobApplicationRow) => ({
  company: row.company,
  title: row.title,
  status: row.status,
  link: row.link,
  contact: row.contact,
  date: row.date,
  stage: row.stage,
  salary: row.salary,
  location: row.location,
  priority: row.priority,
  referral: row.referral,
  notes: row.notes,
});

const DEMO_APPLICATIONS: JobApplicationRow[] = [
  {
    tempId: "demo-1",
    _id: "demo-1",
    company: "Nova Labs",
    title: "Frontend Engineer",
    status: "Interview",
    link: "#",
    contact: "hr@novalabs.com",
    date: new Date().toISOString(),
    stage: "Technical Round",
    salary: "$120k - $150k",
    location: "Remote",
    priority: "High",
    referral: "secured",
    notes: "Preview row for locked viewers.",
    isDraft: false,
  },
  {
    tempId: "demo-2",
    _id: "demo-2",
    company: "Orbit Systems",
    title: "Product Designer",
    status: "Applied",
    link: "#",
    contact: "talent@orbitsystems.com",
    date: new Date().toISOString(),
    stage: "Application Submitted",
    salary: "$90k - $110k",
    location: "Bangalore",
    priority: "Medium",
    referral: "none",
    notes: "Preview row for locked viewers.",
    isDraft: false,
  },
  {
    tempId: "demo-3",
    _id: "demo-3",
    company: "Astra Health",
    title: "Data Analyst",
    status: "Interview",
    link: "#",
    contact: "jobs@astrahealth.com",
    date: new Date().toISOString(),
    stage: "Hiring Manager Round",
    salary: "$70k - $85k",
    location: "Mumbai",
    priority: "High",
    referral: "requested",
    notes: "Preview row for locked viewers.",
    isDraft: false,
  },
];

/**
 * MAIN COMPONENT
 */
export default function SidebarDemo() {
  const [rows, setRows] = useState<JobApplicationRow[]>([]);
  const applicationAbortRef = useRef<AbortController | null>(null);
  const { user, membership } = useUserStore();
  const hasActiveMembership = Boolean(
    membership &&
      membership.status === "active" &&
      ["premium", "ultra"].includes(membership.tier?.toLowerCase() ?? "")
  );
  const isLoggedIn = Boolean(user);
  const jobflixViewBase = process.env.NEXT_PUBLIC_JOBFLIX_VIEW || "";
  const loginHref =
    typeof window !== "undefined"
      ? `${jobflixViewBase}/login?next=${encodeURIComponent(window.location.href)}`
      : `${jobflixViewBase}/login`;
  const membershipHref = jobflixViewBase
    ? `${jobflixViewBase}/my-account/membership`
    : "/my-account/membership";

  const getJobApplications = useCallback(async () => {
    if (!hasActiveMembership) {
      setRows(DEMO_APPLICATIONS);
      return;
    }
    applicationAbortRef.current?.abort();
    const controller = new AbortController();
    applicationAbortRef.current = controller;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_JOBFILX_APIURL}/job/applications`, {
        credentials: 'include',
        signal: controller.signal,
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data && Array.isArray(data.applications)) {
        setRows(data.applications.map(normalizeFetchedRow));
      } else {
        setRows([]);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      console.log("Error fetching job applications", error);
      if (!hasActiveMembership) {
        setRows(DEMO_APPLICATIONS);
      } else {
        setRows([]);
      }
    } finally {
      if (!hasActiveMembership) {
        setRows(DEMO_APPLICATIONS);
      }
    }
  }, [hasActiveMembership]);

  useEffect(() => {
    getJobApplications();
    return () => { applicationAbortRef.current?.abort(); };
  }, [getJobApplications]);

  return (
    <div className="w-full">
      <Dashboard rows={rows} setRows={setRows} reloadRows={getJobApplications} />
    </div>
  );
}

const Dashboard = ({
  rows,
  setRows,
  reloadRows,
}: {
  rows: JobApplicationRow[];
  setRows: Dispatch<SetStateAction<JobApplicationRow[]>>;
  reloadRows: () => Promise<void>;
}) => {
  const [saveLoader, setSaveLoader] = useState(false);
  const [saveEditLoader, setSaveEditLoader] = useState(false);
  const [editingRow, setEditingRow] = useState<JobApplicationRow | null>(null);
  const [editForm, setEditForm] = useState<JobApplicationRow | null>(null);

  const draftCount = rows.filter((row) => row.isDraft).length;
  const { user, membership } = useUserStore();
  const isLoggedIn = Boolean(user);
  const hasAccess = Boolean(
    membership &&
      membership.status === "active" &&
      ["premium", "ultra"].includes(membership.tier?.toLowerCase() ?? "")
  );
  const isLockedPreview = !hasAccess;
  const jobflixViewBase = process.env.NEXT_PUBLIC_JOBFLIX_VIEW || "";
  const loginHref =
    typeof window !== "undefined"
      ? `${jobflixViewBase}/login?next=${encodeURIComponent(window.location.href)}`
      : `${jobflixViewBase}/login`;
  const membershipHref = jobflixViewBase
    ? `${jobflixViewBase}/my-account/membership`
    : "/my-account/membership";

  const addRow = () => {
    if (!hasAccess) {
      toast.error('You need to have an active premium or ultra membership to add a row');
      return;
    }
    const tempId = createId("draft");
    const newRow: JobApplicationRow = {
      tempId,
      _id: tempId,
      company: "",
      title: "",
      status: "Applied",
      link: "",
      contact: "",
      date: new Date().toISOString(),
      stage: "Initial Screening",
      salary: "",
      location: "",
      priority: "Medium",
      referral: "none",
      notes: "",
      isDraft: true,
    };

    setRows((prev) => [newRow, ...prev]);
    openEditModal(newRow);
  };

  const saveDraftRows = async () => {
    if (!hasAccess) return;
    const draftRows = rows.filter((row) => row.isDraft);
    if (draftRows.length === 0) return;

    const invalidDraft = draftRows.find((row) => !row.title.trim());
    if (invalidDraft) {
      toast.error("Each new row needs a title before saving.");
      return;
    }

    try {
      setSaveLoader(true);
      await axiosInstance.post("/job/applications", {
        applications: draftRows.map(cleanApplicationPayload),
      });
      await reloadRows();
      toast.success(`${draftRows.length} application(s) saved.`);
    } catch (error) {
      toast.error("Failed to save applications.");
    } finally {
      setSaveLoader(false);
    }
  };

  const saveSingleDraft = async (row: JobApplicationRow) => {
    if (!hasAccess || !row.isDraft || !row.title.trim()) return;

    const rowKey = getRowKey(row);
    setRows((prev) =>
      prev.map((entry) => (getRowKey(entry) === rowKey ? { ...entry, isSaving: true } : entry))
    );

    try {
      await axiosInstance.post("/job/applications", {
        application: cleanApplicationPayload(row),
      });
      await reloadRows();
      toast.success("Application saved.");
    } catch (error) {
      toast.error("Failed to save row.");
    } finally {
      setRows((prev) =>
        prev.map((entry) => (getRowKey(entry) === rowKey ? { ...entry, isSaving: false } : entry))
      );
    }
  };

  const deleteRow = async (row: JobApplicationRow) => {
    if (!hasAccess) return;
    if (row.isDraft) {
      setRows((prev) => prev.filter((entry) => getRowKey(entry) !== getRowKey(row)));
      return;
    }
    try {
      await axiosInstance.post("/job/application/delete", { id: row._id });
      setRows((prev) => prev.filter((entry) => entry._id !== row._id));
      toast.success("Deleted.");
    } catch (error) {
      toast.error("Delete failed.");
    }
  };

  const updateRowStatus = async (row: JobApplicationRow, status: ApplicationStatus) => {
    if (!hasAccess) return;
    if (row.isDraft) {
      setRows((prev) =>
        prev.map((entry) => (getRowKey(entry) === getRowKey(row) ? { ...entry, status } : entry))
      );
      return;
    }
    try {
      await axiosInstance.put(`/job/application/status/update/${row._id}`, { status });
      setRows((prev) => prev.map((entry) => (entry._id === row._id ? { ...entry, status } : entry)));
      toast.success(`Status updated to ${status}`);
    } catch (error) {
      toast.error("Status update failed.");
    }
  };

  const openEditModal = (row: JobApplicationRow) => {
    setEditingRow(row);
    setEditForm({ ...row });
  };

  const closeEditModal = () => {
    setEditingRow(null);
    setEditForm(null);
  };

  const handleEditChange = (field: EditableField, value: string) => {
    if (editForm) setEditForm({ ...editForm, [field]: value });
  };

  const saveEditedRow = async () => {
    if (!hasAccess || !editForm || !editForm.title.trim() || !editingRow) return;

    if (editForm.isDraft) {
      const rowKey = getRowKey(editForm);
      setRows((prev) => prev.map((entry) => (getRowKey(entry) === rowKey ? { ...editForm } : entry)));
      closeEditModal();
      return;
    }

    const changedFields: Partial<JobApplicationRow> = {};
    (Object.keys(editForm) as Array<keyof JobApplicationRow>).forEach((key) => {
      if (editForm[key] !== editingRow[key]) {
        (changedFields as any)[key] = editForm[key];
      }
    });

    if (Object.keys(changedFields).length === 0) {
      closeEditModal();
      return;
    }

    try {
      setSaveEditLoader(true);
      await axiosInstance.put(`/job/applications/${editForm._id}`, {
        application: changedFields,
      });
      setRows((prev) => prev.map((row) => (row._id === editForm._id ? { ...editForm } : row)));
      closeEditModal();
      toast.success("Updated successfully.");
    } catch (error) {
      toast.error("Update failed.");
    } finally {
      setSaveEditLoader(false);
    }
  };

  const hasChanges = JSON.stringify(editForm) !== JSON.stringify(editingRow);

  return (
    <div className="flex flex-1 min-h-screen bg-slate-50/50 p-4 lg:p-8 font-sans antialiased text-slate-950">
      <div className="flex h-full w-full flex-1 flex-col gap-6 max-w-7xl mx-auto">
        
        {/* PREVIEW LOCK MODE BANNER */}
        <AnimatePresence>
          {isLockedPreview && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="relative overflow-hidden rounded-2xl border border-blue-100 bg-white p-5 shadow-[0_10px_25px_-5px_rgba(59,130,246,0.05)]"
            >
              <div className="absolute top-0 left-0 h-full w-[4px] bg-gradient-to-b from-blue-500 to-indigo-600" />
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700">
                    <Sparkles size={11} className="animate-pulse" /> Preview Mode
                  </div>
                  <h2 className="mt-2 text-sm font-bold text-slate-900 tracking-tight">
                    {isLoggedIn ? "Purchase membership to unlock your full job tracker." : "Login to unlock your full job tracker."}
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500 font-medium">
                    You’re seeing active demo applications in sandboxed view. Unlocking transfers active schemas into live persistent storage tables.
                  </p>
                </div>
                <div>
                  <a
                    href={isLoggedIn ? membershipHref : loginHref}
                    className={cn(
                      "inline-flex h-9 items-center justify-center rounded-xl px-5 text-xs font-bold transition-all shadow-sm hover:translate-y-[-1px]",
                      isLoggedIn 
                        ? "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/10" 
                        : "bg-slate-900 text-white hover:bg-slate-800"
                    )}
                  >
                    {isLoggedIn ? "Purchase Membership" : "Login Portal"}
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CONTAINER SHELL AREA */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-6">
          
          {/* CONTROL BAR DASHBOARD HEADER */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
            <div>
              <h1 className="text-base font-bold tracking-tight text-slate-900">Application Workspace</h1>
              <p className="text-xs font-medium text-slate-400 mt-0.5">
                {isLockedPreview ? "Showing 3 demo jobs in sandboxed workspace view." : `Syncing ${rows.length} production nodes securely.`}
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={saveDraftRows}
                disabled={saveLoader || draftCount === 0 || !hasAccess}
                className="text-xs font-semibold h-9 border-indigo-200 text-indigo-700 bg-indigo-50/40 hover:bg-indigo-50/80 rounded-xl px-4 transition-all"
              >
                <Save size={13} className="mr-1.5 stroke-[2.5]" />
                {saveLoader ? "Saving Changes..." : hasAccess ? `Save Drafts (${draftCount})` : "Locked Workspace"}
              </Button>
              {hasAccess && (
                <Button size="sm" onClick={addRow} className="text-xs font-semibold h-9 bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-4 shadow-sm transition-all">
                  <Plus size={14} className="mr-1.5 stroke-[2.5]" /> Add Entry
                </Button>
              )}
            </div>
          </div>

          {/* DYNAMIC PIPELINE OVERVIEW PIP BLOCK */}
          <div className="overflow-x-auto rounded-xl border border-slate-200/70 shadow-3xs overflow-hidden">
            <table className="w-full min-w-[1000px] text-left text-xs border-collapse">
              <thead className="bg-slate-50/70 border-b border-slate-200/80">
                <tr>
                  {["Company Name", "Position Title", "Current Status", "Priority Node", "Location", "Applied Date", "Interview Stage", "Controls"].map((header) => (
                    <th key={header} className="px-5 py-3.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80 bg-white font-medium text-slate-600">
                {rows.length === 0 ? (
                  <tr>
                    <td className="px-5 py-12 text-center text-slate-400 font-medium" colSpan={8}>
                      No tracking schemas mapped. Click "Add Entry" to initialize layout rows.
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => {
                    const theme = STATUS_THEMES[row.status] || STATUS_THEMES.Applied;
                    return (
                      <tr key={getRowKey(row)} className={cn("hover:bg-slate-50/40 transition-colors group", row.isDraft && "bg-amber-50/20")}>
                        
                        {/* Company Identity */}
                        <td className="px-5 py-4 font-bold text-slate-900 tracking-tight">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-50 text-slate-400 border border-slate-200/60 shadow-3xs">
                              <Building2 size={13} />
                            </div>
                            {row.company || "—"}
                          </div>
                        </td>

                        {/* Title Role Entry */}
                        <td className="px-5 py-4 font-semibold text-slate-800">
                          <div className="flex items-center gap-2">
                            {row.title || "—"}
                            {row.isDraft && <span className="rounded-md bg-amber-50 border border-amber-200 px-2 py-0.5 text-[9px] text-amber-700 font-bold uppercase tracking-wide">Draft</span>}
                          </div>
                        </td>

                        {/* Status Radix Menu Control Component */}
                        <td className="px-5 py-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger disabled={!hasAccess} className={cn(
                              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold shadow-3xs transition-all outline-none",
                              theme.bg, theme.text, theme.hover
                            )}>
                              <span className={cn("h-1.5 w-1.5 rounded-full", theme.dot)} />
                              {theme.label}
                              <ChevronDown size={11} className="opacity-60 ml-0.5" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="rounded-xl border border-slate-200 bg-white p-1 shadow-md text-xs font-semibold text-slate-700 min-w-[120px]">
                              {(Object.keys(STATUS_THEMES) as ApplicationStatus[]).map((st) => (
                                <DropdownMenuItem key={st} onClick={() => updateRowStatus(row, st)} className="flex items-center gap-2 rounded-lg px-2 py-1.5 cursor-pointer hover:bg-slate-50">
                                  <span className={cn("h-1.5 w-1.5 rounded-full", STATUS_THEMES[st].dot)} />
                                  {STATUS_THEMES[st].label}
                                  {row.status === st && <Check size={12} className="ml-auto text-slate-900" />}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>

                        {/* Priority Badge */}
                        <td className="px-5 py-4">
                          <span className={cn("px-2.5 py-0.5 rounded-md text-[10px] font-bold border shadow-3xs", PRIORITY_THEMES[row.priority] || PRIORITY_THEMES.Medium)}>
                            {row.priority}
                          </span>
                        </td>

                        {/* Location Element Block */}
                        <td className="px-5 py-4 text-slate-500 font-medium">
                          <div className="flex items-center gap-1.5">
                            <MapPin size={12} className="text-slate-400" />
                            {row.location || "—"}
                          </div>
                        </td>

                        {/* Epoch Formatted Date Calendar String */}
                        <td className="px-5 py-4 text-slate-500 font-medium">
                          {row.date ? format(new Date(row.date), "MMM dd, yyyy") : "—"}
                        </td>

                        {/* Progress Screen State Level */}
                        <td className="px-5 py-4 text-slate-800 font-bold tracking-tight">{row.stage || "—"}</td>

                        {/* Operations Layout Button Group */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                            {row.isDraft && hasAccess && (
                              <button onClick={() => saveSingleDraft(row)} className="text-emerald-600 font-bold hover:text-emerald-700 text-xs px-2 py-1 rounded-md hover:bg-emerald-50 transition-colors">Sync</button>
                            )}
                            <button onClick={() => openEditModal(row)} className="text-slate-400 hover:text-slate-800 transition-colors p-1.5 rounded-lg hover:bg-slate-100" title="Modify Index Elements">
                              <Edit3 size={13} />
                            </button>
                            <button onClick={() => deleteRow(row)} className="text-slate-400 hover:text-rose-600 transition-colors p-1.5 rounded-lg hover:bg-rose-50" title="Discard Model Element Row">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* COLORFUL MODAL INPUT EDITOR */}
          <AnimatePresence>
            {editingRow && editForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs">
                
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0" onClick={closeEditModal} />

                <motion.div 
                  initial={{ opacity: 0, scale: 0.97, y: 12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97, y: 12 }}
                  transition={{ type: "spring", duration: 0.4, bounce: 0.1 }}
                  className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl relative z-10 max-h-[92vh] overflow-y-auto flex flex-col overflow-hidden"
                >
                  {/* Decorative Border Identity Gradient Line */}
                  <div className="h-1.5 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 shrink-0" />

                  {/* Header Form Node Container Panel */}
                  <div className="p-6 border-b border-slate-100 flex justify-between items-start shrink-0 bg-slate-50/50">
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <FileText size={16} className="text-indigo-500" /> Pipeline Parameter Ledger
                      </h3>
                      <p className="text-xs font-medium text-slate-500">
                        Modifying operational indexes for <span className="font-bold text-slate-800">{editForm.company || "New Identity Vector"}</span>
                      </p>
                    </div>
                    <button onClick={closeEditModal} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 transition-colors">
                      <X size={15} strokeWidth={2.5} />
                    </button>
                  </div>

                  {/* High-Fidelity Input Content Schema Layout Grid */}
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5 overflow-y-auto">

                    {/* Corporate Entity Block */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <Building2 size={11} className="text-blue-500" /> Corporate Entity
                      </label>
                      <Input
                        value={editForm.company}
                        onChange={(e) => handleEditChange("company", e.target.value)}
                        placeholder="e.g. Google"
                        className="bg-white border-slate-200 rounded-xl text-xs font-semibold focus-visible:ring-2 focus-visible:ring-indigo-500 h-10 shadow-3xs text-slate-900 focus-visible:border-transparent"
                      />
                    </div>

                    {/* Designation Title Block */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <Briefcase size={11} className="text-indigo-500" /> Designation Title
                      </label>
                      <Input
                        value={editForm.title}
                        onChange={(e) => handleEditChange("title", e.target.value)}
                        placeholder="e.g. Senior Staff Architect"
                        className="bg-white border-slate-200 rounded-xl text-xs font-semibold focus-visible:ring-2 focus-visible:ring-indigo-500 h-10 shadow-3xs text-slate-900 focus-visible:border-transparent"
                      />
                    </div>

                    {/* Destination Target URI Vector */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <Link2 size={11} className="text-sky-500" /> Target URL Vector
                      </label>
                      <Input
                        value={editForm.link}
                        onChange={(e) => handleEditChange("link", e.target.value)}
                        placeholder="https://careers.google.com/..."
                        className="bg-white border-slate-200 rounded-xl text-xs font-semibold focus-visible:ring-2 focus-visible:ring-indigo-500 h-10 shadow-3xs text-slate-900 focus-visible:border-transparent"
                      />
                    </div>

                    {/* Remuneration Input Canvas Block */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <DollarSign size={11} className="text-emerald-500" /> Remuneration Scale
                      </label>
                      <Input
                        value={editForm.salary}
                        onChange={(e) => handleEditChange("salary", e.target.value)}
                        placeholder="e.g. $140k - $160k"
                        className="bg-white border-slate-200 rounded-xl text-xs font-semibold focus-visible:ring-2 focus-visible:ring-indigo-500 h-10 shadow-3xs text-slate-900 focus-visible:border-transparent"
                      />
                    </div>

                    {/* Epoch Timestamp Popover Box Field */}
                    <div className="space-y-1.5 flex flex-col">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-0.5">
                        <CalendarIcon size={11} className="text-amber-500" /> System Epoch Date
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-semibold text-xs bg-white border-slate-200 rounded-xl hover:bg-slate-50 focus:ring-2 focus:ring-indigo-500 h-10 shadow-3xs text-slate-900",
                              !editForm.date && "text-slate-400"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-3.5 w-3.5 text-slate-400" />
                            {editForm.date ? format(new Date(editForm.date), "PPP") : <span>Select Calendar Coordinates</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 border border-slate-200 bg-white shadow-xl rounded-xl" align="start">
                          <Calendar
                            mode="single"
                            selected={editForm.date ? new Date(editForm.date) : undefined}
                            onSelect={(d) => handleEditChange("date", d ? d.toISOString() : "")}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Dropdown Process Phase Step Selector */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <ExternalLink size={11} className="text-purple-500" /> Evaluation Pipeline Phase
                      </label>
                      <Select value={editForm.stage} onValueChange={(val) => handleEditChange("stage", val)}>
                        <SelectTrigger className="border-slate-200 bg-white rounded-xl text-xs font-semibold text-slate-800 h-10 focus:ring-2 focus:ring-indigo-500 shadow-3xs">
                          <SelectValue placeholder="Identify Stage Level" />
                        </SelectTrigger>
                        <SelectContent className="border border-slate-200 bg-white rounded-xl shadow-xl text-xs font-semibold text-slate-700">
                          <SelectItem value="Initial Screening" className="cursor-pointer focus:bg-slate-50 rounded-lg">Initial Screening</SelectItem>
                          <SelectItem value="Technical Round" className="cursor-pointer focus:bg-slate-50 rounded-lg">Technical Round</SelectItem>
                          <SelectItem value="Managerial Round" className="cursor-pointer focus:bg-slate-50 rounded-lg">Managerial Round</SelectItem>
                          <SelectItem value="Culture Fit" className="cursor-pointer focus:bg-slate-50 rounded-lg">Culture Fit</SelectItem>
                          <SelectItem value="Final Round" className="cursor-pointer focus:bg-slate-50 rounded-lg">Final Round</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Localization Block Field Node */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <MapPin size={11} className="text-rose-500" /> Geographic Node
                      </label>
                      <Input
                        value={editForm.location}
                        onChange={(e) => handleEditChange("location", e.target.value)}
                        placeholder="Remote / Hybrid / City"
                        className="bg-white border-slate-200 rounded-xl text-xs font-semibold focus-visible:ring-2 focus-visible:ring-indigo-500 h-10 shadow-3xs text-slate-900 focus-visible:border-transparent"
                      />
                    </div>

                    {/* Critical Selection Level Dropdown */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Critical Priority Tier</label>
                      <Select value={editForm.priority} onValueChange={(val) => handleEditChange("priority", val)}>
                        <SelectTrigger className="border-slate-200 bg-white rounded-xl text-xs font-semibold text-slate-800 h-10 focus:ring-2 focus:ring-indigo-500 shadow-3xs">
                          <SelectValue placeholder="Identify Priority State" />
                        </SelectTrigger>
                        <SelectContent className="border border-slate-200 bg-white rounded-xl shadow-xl text-xs font-semibold text-slate-700">
                          <SelectItem value="High" className="cursor-pointer focus:bg-rose-50 focus:text-rose-700 rounded-lg">High 🔥</SelectItem>
                          <SelectItem value="Medium" className="cursor-pointer focus:bg-indigo-50 focus:text-indigo-700 rounded-lg">Medium ⚡</SelectItem>
                          <SelectItem value="Low" className="cursor-pointer focus:bg-slate-100 rounded-lg">Low 🧊</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Referral Protocol Dropdown Block Selector */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Channel Referral Protocol</label>
                      <Select value={editForm.referral} onValueChange={(val) => handleEditChange("referral", val)}>
                        <SelectTrigger className="border-slate-200 bg-white rounded-xl text-xs font-semibold text-slate-800 h-10 focus:ring-2 focus:ring-indigo-500 shadow-3xs">
                          <SelectValue placeholder="Identify Channel Vector" />
                        </SelectTrigger>
                        <SelectContent className="border border-slate-200 bg-white rounded-xl shadow-xl text-xs font-semibold text-slate-700">
                          <SelectItem value="none" className="cursor-pointer focus:bg-slate-50 rounded-lg">Cold Protocol</SelectItem>
                          <SelectItem value="requested" className="cursor-pointer focus:bg-slate-50 rounded-lg">Referral Requested</SelectItem>
                          <SelectItem value="secured" className="cursor-pointer focus:bg-slate-50 rounded-lg">Referral Secured</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Point of Contact Field Node Block Input */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <UserCheck size={11} className="text-teal-500" /> Direct Intermediary Node
                      </label>
                      <Input
                        value={editForm.contact}
                        onChange={(e) => handleEditChange("contact", e.target.value)}
                        placeholder="Recruiter routing name or data email"
                        className="bg-white border-slate-200 rounded-xl text-xs font-semibold focus-visible:ring-2 focus-visible:ring-indigo-500 h-10 shadow-3xs text-slate-900 focus-visible:border-transparent"
                      />
                    </div>

                    {/* Internal Analysis Document Log Canvas Textarea */}
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Internal Analysis Analysis Ledger</label>
                      <textarea
                        value={editForm.notes}
                        onChange={(e) => handleEditChange("notes", e.target.value)}
                        placeholder="Record deployment stack attributes, internal framework red flags, operational milestones..."
                        className="w-full min-h-[110px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 transition-all placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-3xs"
                      />
                    </div>
                  </div>

                  {/* Operational Bottom Control Action Pane */}
                  <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 shrink-0">
                    <Button variant="ghost" onClick={closeEditModal} className="text-slate-500 hover:bg-slate-200/60 hover:text-slate-800 rounded-xl text-xs font-bold">
                      Discard Changes
                    </Button>
                    <Button
                      onClick={saveEditedRow}
                      disabled={saveEditLoader || !hasChanges}
                      className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 rounded-xl text-xs shadow-sm transition-all disabled:opacity-40"
                    >
                      {saveEditLoader ? "Syncing Workspace..." : "Commit Parameter Changes"}
                    </Button>
                  </div>

                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};