"use client";

import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import HrEmailsTable from "./hr-emails-table";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
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

/**
 * TYPES
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

/**
 * MAIN COMPONENT
 */
export default function SidebarDemo() {
  const [rows, setRows] = useState<JobApplicationRow[]>([]);

  const getJobApplications = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/job/applications`, {
        credentials: 'include',
      });
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Failed to load job applications.");
        return;
      }

      if (Array.isArray(data.applications)) {
        setRows(data.applications.map(normalizeFetchedRow));
      } else {
        setRows([]);
      }
    } catch (error) {
      console.error("Error fetching job applications", error);
    }
  }, []);

  useEffect(() => {
    getJobApplications();
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
  const [view, setView] = useState<"tracker" | "emails">("tracker");
  const [saveLoader, setSaveLoader] = useState(false);
  const [saveEditLoader, setSaveEditLoader] = useState(false);
  const [editingRow, setEditingRow] = useState<JobApplicationRow | null>(null);
  const [editForm, setEditForm] = useState<JobApplicationRow | null>(null);

  const draftCount = rows.filter((row) => row.isDraft).length;

  const addRow = () => {
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
    const draftRows = rows.filter((row) => row.isDraft);
    if (draftRows.length === 0) return;

    const invalidDraft = draftRows.find((row) => !row.title.trim());
    if (invalidDraft) {
      toast.error("Each new row needs a title before saving.");
      return;
    }

    try {
      setSaveLoader(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/job/applications`, {
        method: "POST",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applications: draftRows.map(cleanApplicationPayload),
        }),
      });

      if (!response.ok) throw new Error();
      await reloadRows();
      toast.success(`${draftRows.length} application(s) saved.`);
    } catch (error) {
      toast.error("Failed to save applications.");
    } finally {
      setSaveLoader(false);
    }
  };

  const saveSingleDraft = async (row: JobApplicationRow) => {
    if (!row.isDraft || !row.title.trim()) return;

    const rowKey = getRowKey(row);
    setRows((prev) =>
      prev.map((entry) => (getRowKey(entry) === rowKey ? { ...entry, isSaving: true } : entry))
    );

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/job/applications`, {
        method: "POST",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ application: cleanApplicationPayload(row) }),
      });

      if (!response.ok) throw new Error();
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
    if (row.isDraft) {
      setRows((prev) => prev.filter((entry) => getRowKey(entry) !== getRowKey(row)));
      return;
    }
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/job/application/delete`, {
        method: "POST",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: row._id }),
      });
      setRows((prev) => prev.filter((entry) => entry._id !== row._id));
      toast.success("Deleted.");
    } catch (error) {
      toast.error("Delete failed.");
    }
  };

  const updateRowStatus = async (row: JobApplicationRow, status: ApplicationStatus) => {
    if (row.isDraft) {
      setRows((prev) =>
        prev.map((entry) => (getRowKey(entry) === getRowKey(row) ? { ...entry, status } : entry))
      );
      return;
    }
    try {
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/job/application/status/update/${row._id}`, {
        method: "PUT",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      setRows((prev) => prev.map((entry) => (entry._id === row._id ? { ...entry, status } : entry)));
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

  /**
   * PARTIAL UPDATE LOGIC
   */
  const saveEditedRow = async () => {
    if (!editForm || !editForm.title.trim() || !editingRow) return;

    if (editForm.isDraft) {
      const rowKey = getRowKey(editForm);
      setRows((prev) => prev.map((entry) => (getRowKey(entry) === rowKey ? { ...editForm } : entry)));
      closeEditModal();
      return;
    }

    // Identify only changed fields
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
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/job/applications/${editForm._id}`, {
        method: "PUT",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ application: changedFields }),
      });

      if (!response.ok) throw new Error();
      
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
    <div className="flex flex-1">
      <div className="flex h-full w-full flex-1 flex-col gap-6 bg-neutral-50 p-4 md:p-6">
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between border-b pb-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 font-bold">Workspace</p>
              <p className="text-lg font-semibold text-neutral-900">Job Tracker</p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 p-1">
              <button
                onClick={() => setView("tracker")}
                className={cn(
                  "rounded-full px-4 py-1.5 text-[11px] font-semibold transition",
                  view === "tracker" ? "bg-neutral-900 text-white shadow" : "text-neutral-500 hover:text-neutral-700"
                )}
              >
                Job Tracker UI
              </button>
              <button
                onClick={() => setView("emails")}
                className={cn(
                  "rounded-full px-4 py-1.5 text-[11px] font-semibold transition",
                  view === "emails" ? "bg-neutral-900 text-white shadow" : "text-neutral-500 hover:text-neutral-700"
                )}
              >
                HR Emails
              </button>
            </div>
          </div>

          {view === "tracker" ? (
            <>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-neutral-900">Active Applications</p>
                  <p className="text-xs text-neutral-500">Managing {rows.length} total applications.</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={saveDraftRows}
                    disabled={saveLoader || draftCount === 0}
                    className="text-[11px] h-8 border-blue-200 text-blue-700 bg-blue-50/50 hover:bg-blue-50"
                  >
                    {saveLoader ? "Saving..." : `Save Drafts (${draftCount})`}
                  </Button>
                  <Button size="sm" onClick={addRow} className="text-[11px] h-8 bg-neutral-900 text-white">
                    Add Row
                  </Button>
                </div>
              </div>

              <div className="mt-4 overflow-x-auto rounded-lg border border-neutral-200 shadow-sm">
                <table className="w-full min-w-[1000px] text-left text-xs">
                  <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500">
                    <tr>
                      <th className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Company</th>
                      <th className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Title</th>
                      <th className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Status</th>
                      <th className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Priority</th>
                      <th className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Location</th>
                      <th className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Applied Date</th>
                      <th className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Stage</th>
                      <th className="px-4 py-3 font-bold uppercase tracking-wider text-[10px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-neutral-100">
                    {rows.length === 0 ? (
                      <tr>
                        <td className="px-4 py-10 text-center text-neutral-400" colSpan={8}>
                          No applications found. Click "Add Row" to start.
                        </td>
                      </tr>
                    ) : (
                      rows.map((row) => (
                        <tr key={getRowKey(row)} className={cn("hover:bg-neutral-50/50 transition-colors", row.isDraft && "bg-amber-50/30")}>
                          <td className="px-4 py-3 font-medium text-neutral-900">{row.company || "-"}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {row.title || "-"}
                              {row.isDraft && <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] text-amber-700 font-bold uppercase">Draft</span>}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={row.status}
                              onChange={(e) => updateRowStatus(row, e.target.value as ApplicationStatus)}
                              className="rounded-full border border-neutral-200 bg-white px-2 py-1 text-[10px] font-semibold"
                            >
                              <option value="Applied">Applied</option>
                              <option value="Interview">Interview</option>
                              <option value="Offer">Offer</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <span className={cn(
                              "px-2 py-0.5 rounded text-[10px] font-bold",
                              row.priority === "High" ? "bg-red-50 text-red-600 border border-red-100" :
                              row.priority === "Medium" ? "bg-blue-50 text-blue-600 border border-blue-100" :
                              "bg-neutral-50 text-neutral-500 border border-neutral-200"
                            )}>
                              {row.priority}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-neutral-500">{row.location || "-"}</td>
                          <td className="px-4 py-3 text-neutral-500">
                            {row.date ? format(new Date(row.date), "MMM dd, yyyy") : "-"}
                          </td>
                          <td className="px-4 py-3 text-neutral-500 font-medium">{row.stage || "-"}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {row.isDraft && (
                                <button onClick={() => saveSingleDraft(row)} className="text-emerald-600 font-bold hover:text-emerald-700">Save</button>
                              )}
                              <button onClick={() => openEditModal(row)} className="text-neutral-500 hover:text-neutral-900">Edit</button>
                              <button onClick={() => deleteRow(row)} className="text-red-400 hover:text-red-600">Delete</button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* EDIT MODAL */}
              {editingRow && editForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
                  <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
                    <div className="mb-6 flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-neutral-900 tracking-tight">Edit Application</h3>
                        <p className="text-sm text-neutral-500">Refine details for {editForm.company || "New Application"}</p>
                      </div>
                      <button onClick={closeEditModal} className="text-neutral-400 hover:text-neutral-600">✕</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Company</label>
                        <Input value={editForm.company} onChange={(e) => handleEditChange("company", e.target.value)} placeholder="e.g. Google" />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Job Title</label>
                        <Input value={editForm.title} onChange={(e) => handleEditChange("title", e.target.value)} placeholder="e.g. Senior Developer" />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Posting Link</label>
                        <Input value={editForm.link} onChange={(e) => handleEditChange("link", e.target.value)} placeholder="https://linkedin.com/..." />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Salary Range</label>
                        <Input value={editForm.salary} onChange={(e) => handleEditChange("salary", e.target.value)} placeholder="e.g. $140k - $160k" />
                      </div>

                      <div className="space-y-1.5 flex flex-col">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Applied Date</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !editForm.date && "text-muted-foreground")}>
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {editForm.date ? format(new Date(editForm.date), "PPP") : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={editForm.date ? new Date(editForm.date) : undefined} onSelect={(d) => handleEditChange("date", d ? d.toISOString() : "")} initialFocus />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Interview Stage</label>
                        <Select value={editForm.stage} onValueChange={(val) => handleEditChange("stage", val)}>
                          <SelectTrigger><SelectValue placeholder="Select Stage" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Initial Screening">Initial Screening</SelectItem>
                            <SelectItem value="Technical Round">Technical Round</SelectItem>
                            <SelectItem value="Managerial Round">Managerial Round</SelectItem>
                            <SelectItem value="Culture Fit">Culture Fit</SelectItem>
                            <SelectItem value="Final Round">Final Round</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Location</label>
                        <Input value={editForm.location} onChange={(e) => handleEditChange("location", e.target.value)} placeholder="Remote / Hybrid / City" />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Priority</label>
                        <Select value={editForm.priority} onValueChange={(val) => handleEditChange("priority", val)}>
                          <SelectTrigger><SelectValue placeholder="Select Priority" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="High">High 🔥</SelectItem>
                            <SelectItem value="Medium">Medium ⚡</SelectItem>
                            <SelectItem value="Low">Low 🧊</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Referral Status</label>
                        <Select value={editForm.referral} onValueChange={(val) => handleEditChange("referral", val)}>
                          <SelectTrigger><SelectValue placeholder="Referral status?" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Cold Applied</SelectItem>
                            <SelectItem value="requested">Requested</SelectItem>
                            <SelectItem value="secured">Referral Secured</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Point of Contact</label>
                        <Input value={editForm.contact} onChange={(e) => handleEditChange("contact", e.target.value)} placeholder="Recruiter name or email" />
                      </div>

                      <div className="space-y-1.5 md:col-span-2">
                        <label className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Internal Notes</label>
                        <textarea
                          value={editForm.notes}
                          onChange={(e) => handleEditChange("notes", e.target.value)}
                          placeholder="Tech stack, red flags, follow-up reminders..."
                          className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        />
                      </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3 border-t pt-5">
                      <Button variant="ghost" onClick={closeEditModal} className="text-neutral-500">Cancel</Button>
                      <Button onClick={saveEditedRow} disabled={saveEditLoader || !hasChanges} className="bg-blue-600 hover:bg-blue-700 text-white px-8">
                        {saveEditLoader ? "Saving..." : "Save Changes"}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <HrEmailsTable className="mt-4" />
          )}
        </div>
      </div>
    </div>
  );
};