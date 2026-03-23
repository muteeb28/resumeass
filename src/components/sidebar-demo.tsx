import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import HrEmailsTable from "./hr-emails-table";
import toast from "react-hot-toast";

type ApplicationStatus = "Offer" | "Rejected" | "Interview" | "Applied";
type EditableField = "company" | "title" | "link" | "contact" | "date" | "stage";
type CustomColumn = { _id: string; label: string };

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
  custom: Record<string, string>;
  isDraft?: boolean;
  isSaving?: boolean;
};

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
  stage: row?.stage || "",
  custom: row?.custom && typeof row.custom === "object" ? row.custom : {},
});

const cleanApplicationPayload = (row: JobApplicationRow) => ({
  company: row.company || "",
  title: row.title || "",
  status: row.status || "Applied",
  link: row.link || "",
  contact: row.contact || "",
  date: row.date || "",
  stage: row.stage || "",
  custom: row.custom || {},
});

export default function SidebarDemo() {
  const [rows, setRows] = useState<JobApplicationRow[]>([]);

  const getJobApplications = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/job/applications`);
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
      console.log("some error occured while fetching job applications", error);
      toast.error("Unable to fetch job applications.");
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

export const Logo = () => {
  return (
    <a
      href="#"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-neutral-900"
    >
      <div className="h-5 w-6 shrink-0 rounded-bl-sm rounded-br-lg rounded-tl-lg rounded-tr-sm bg-neutral-900" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="whitespace-pre font-medium text-neutral-900"
      >
        ResumeAssist AI
      </motion.span>
    </a>
  );
};

export const LogoIcon = () => {
  return (
    <a
      href="#"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-neutral-900"
    >
      <div className="h-5 w-6 shrink-0 rounded-bl-sm rounded-br-lg rounded-tl-lg rounded-tr-sm bg-neutral-900" />
    </a>
  );
};

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
  const [customColumns, setCustomColumns] = useState<CustomColumn[]>([]);
  const [saveLoader, setSaveLoader] = useState(false);
  const [saveEditLoader, setSaveEditLoader] = useState(false);

  const draftCount = rows.filter((row) => row.isDraft).length;

  useEffect(() => {
    const allKeys = new Set<string>();
    rows.forEach((row) => {
      if (!row.custom || typeof row.custom !== "object") return;
      Object.keys(row.custom).forEach((key) => allKeys.add(key));
    });

    if (allKeys.size === 0) return;

    setCustomColumns((prev) => {
      const existingIds = new Set(prev.map((c) => c._id));
      const toAdd: CustomColumn[] = [];
      allKeys.forEach((key) => {
        if (!existingIds.has(key)) toAdd.push({ _id: key, label: key });
      });
      return toAdd.length > 0 ? [...prev, ...toAdd] : prev;
    });
  }, [rows]);

  const addRow = () => {
    const tempId = createId("draft");
    const custom = customColumns.reduce<Record<string, string>>((acc, column) => {
      acc[column._id] = "";
      return acc;
    }, {});

    const newRow: JobApplicationRow = {
      tempId,
      _id: tempId,
      company: "",
      title: "",
      status: "Applied",
      link: "",
      contact: "",
      date: "",
      stage: "",
      custom,
      isDraft: true,
    };

    setRows((prev) => [newRow, ...prev]);
    openEditModal(newRow);
  };

  const saveDraftRows = async () => {
    const draftRows = rows.filter((row) => row.isDraft);

    if (draftRows.length === 0) {
      toast.error("No draft rows found.");
      return;
    }

    const invalidDraft = draftRows.find((row) => !row.title.trim());
    if (invalidDraft) {
      toast.error("Each new row needs a title before saving.");
      return;
    }

    try {
      setSaveLoader(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/job/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applications: draftRows.map(cleanApplicationPayload),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        toast.error(data.message || "Failed to save new rows.");
        return;
      }

      await reloadRows();
      toast.success(`${draftRows.length} application(s) saved.`);
    } catch (error) {
      console.error("Error saving applications:", error);
      toast.error("Failed to save applications.");
    } finally {
      setSaveLoader(false);
    }
  };

  const saveSingleDraft = async (row: JobApplicationRow) => {
    if (!row.isDraft) return;

    if (!row.title.trim()) {
      toast.error("Title is required before saving.");
      return;
    }

    const rowKey = getRowKey(row);
    setRows((prev) =>
      prev.map((entry) =>
        getRowKey(entry) === rowKey ? { ...entry, isSaving: true } : entry
      )
    );

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/job/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          application: cleanApplicationPayload(row),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        toast.error(data.message || "Failed to save row.");
        return;
      }

      if (data.application) {
        const savedRow = normalizeFetchedRow(data.application);
        setRows((prev) =>
          prev.map((entry) =>
            getRowKey(entry) === rowKey ? savedRow : entry
          )
        );
      } else {
        await reloadRows();
      }

      toast.success("Application saved successfully.");
    } catch (error) {
      console.error("Error saving row:", error);
      toast.error("Failed to save row.");
    } finally {
      setRows((prev) =>
        prev.map((entry) =>
          getRowKey(entry) === rowKey ? { ...entry, isSaving: false } : entry
        )
      );
    }
  };

  const deleteRow = async (row: JobApplicationRow) => {
    try {
      if (row.isDraft) {
        setRows((prev) => prev.filter((entry) => getRowKey(entry) !== getRowKey(row)));
        toast.success("Draft removed.");
        return;
      }

      if (!row._id) {
        toast.error("Unable to delete row.");
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/job/application/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: row._id }),
      });

      const result = await response.json();
      if (!response.ok) {
        toast.error(result.message || "Failed to delete application.");
        return;
      }

      setRows((prev) => prev.filter((entry) => entry._id !== row._id));
      toast.success("Application deleted successfully.");
    } catch (error: any) {
      toast.error("Failed to delete application. Try again later.", error);
    }
  };

  const updateRowStatus = async (row: JobApplicationRow, status: ApplicationStatus) => {
    if (row.isDraft) {
      setRows((prev) =>
        prev.map((entry) =>
          getRowKey(entry) === getRowKey(row) ? { ...entry, status } : entry
        )
      );
      return;
    }

    if (!row._id) {
      toast.error("Unable to update row status.");
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/job/application/status/update/${row._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const result = await response.json();
      if (!response.ok) {
        toast.error(result.message || "Failed to update application.");
        return;
      }

      setRows((prev) =>
        prev.map((entry) => (entry._id === row._id ? { ...entry, status } : entry))
      );
      toast.success("Application status updated.");
    } catch (error: any) {
      toast.error("Failed to update application. Try again later.", error);
    }
  };

  const addColumn = () => {
    const _id = createId("column");
    setCustomColumns((prev) => [...prev, { _id, label: "New Column" }]);
    setRows((prev) =>
      prev.map((row) => ({
        ...row,
        custom: { ...(row.custom || {}), [_id]: "" },
      }))
    );
  };

  const [editingRow, setEditingRow] = useState<JobApplicationRow | null>(null);
  const [editForm, setEditForm] = useState<JobApplicationRow | null>(null);

  const openEditModal = (row: JobApplicationRow) => {
    setEditingRow(row);
    setEditForm({ ...row, custom: { ...(row.custom || {}) } });
  };

  const closeEditModal = () => {
    setEditingRow(null);
    setEditForm(null);
  };

  const handleEditChange = (field: EditableField, value: string) => {
    if (!editForm) return;
    setEditForm({ ...editForm, [field]: value });
  };

  const handleEditCustomChange = (columnId: string, value: string) => {
    if (!editForm) return;
    setEditForm({ ...editForm, custom: { ...editForm.custom, [columnId]: value } });
  };

  const saveEditedRow = async () => {
    if (!editForm) return;

    if (!editForm.title.trim()) {
      toast.error("Title is required.");
      return;
    }

    if (editForm.isDraft) {
      const rowKey = getRowKey(editForm);
      setRows((prev) =>
        prev.map((entry) =>
          getRowKey(entry) === rowKey
            ? { ...editForm, isDraft: true, isSaving: false }
            : entry
        )
      );
      closeEditModal();
      toast.success("Draft updated. Click Save on the row or Save Drafts.");
      return;
    }

    try {
      setSaveEditLoader(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/job/applications/${editForm._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          application: cleanApplicationPayload(editForm),
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        toast.error(result.message || "Failed to update application.");
        return;
      }

      toast.success("Application updated successfully.");
      setRows((prev) =>
        prev.map((row) =>
          row._id === editForm._id ? { ...editForm, isDraft: false } : row
        )
      );
      closeEditModal();
    } catch (error: any) {
      toast.error("Failed to update application. Try again later.", error);
    } finally {
      setSaveEditLoader(false);
    }
  };

  return (
    <div className="flex flex-1">
      <div className="flex h-full w-full flex-1 flex-col gap-6 bg-neutral-50 p-4 md:p-6">
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-[0_1px_0_rgba(0,0,0,0.04)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-400">Workspace</p>
              <p className="text-lg font-semibold text-neutral-900">Job Tracker Preview</p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 p-1">
              <div className="px-2 py-2">
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = "/login";
                  }}
                  className="cursor-pointer rounded-full border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400"
                >
                  Unlock 1,800 HR profiles
                </button>
              </div>
              <button
                type="button"
                onClick={() => setView("tracker")}
                className={cn(
                  "rounded-full px-4 py-1.5 text-[11px] font-semibold transition",
                  view === "tracker"
                    ? "bg-neutral-900 text-white shadow"
                    : "text-neutral-500 hover:text-neutral-900"
                )}
              >
                Job Tracker UI
              </button>
              <button
                type="button"
                onClick={() => setView("emails")}
                className={cn(
                  "rounded-full px-4 py-1.5 text-[11px] font-semibold transition",
                  view === "emails"
                    ? "bg-neutral-900 text-white shadow"
                    : "text-neutral-500 hover:text-neutral-900"
                )}
              >
                HR Emails
              </button>
            </div>
          </div>

          {view === "tracker" ? (
            <>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-neutral-900">Job Applications Tracker</p>
                  <p className="text-xs text-neutral-500">
                    Add rows quickly, edit in modal, and save each row instantly or in bulk.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={saveDraftRows}
                    disabled={saveLoader || draftCount === 0}
                    className="inline-flex h-8 items-center rounded-md border border-blue-700 bg-blue-600 px-2.5 text-[11px] font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:border-blue-100 disabled:bg-blue-100"
                  >
                    {saveLoader ? "Saving..." : `Save Drafts (${draftCount})`}
                  </button>
                  <button
                    type="button"
                    onClick={addRow}
                    className="inline-flex h-8 items-center rounded-md border border-neutral-200 bg-white px-2.5 text-[11px] font-semibold text-neutral-700 transition hover:border-neutral-300"
                  >
                    Add Row
                  </button>
                  <button
                    type="button"
                    onClick={addColumn}
                    className="inline-flex h-8 items-center rounded-md border border-neutral-200 bg-white px-2.5 text-[11px] font-semibold text-neutral-700 transition hover:border-neutral-300"
                  >
                    Add Column
                  </button>
                </div>
              </div>

              <div className="mt-4 overflow-x-auto rounded-lg border border-neutral-200">
                <table className="min-w-[720px] w-full text-left text-xs">
                  <thead className="bg-neutral-900 text-white">
                    <tr>
                      <th className="px-3 py-2 font-semibold">Company</th>
                      <th className="px-3 py-2 font-semibold">Title</th>
                      <th className="px-3 py-2 font-semibold">Status</th>
                      <th className="px-3 py-2 font-semibold">Job Posting Link</th>
                      <th className="px-3 py-2 font-semibold">Contact</th>
                      <th className="px-3 py-2 font-semibold">Application Date</th>
                      <th className="px-3 py-2 font-semibold">Interview Stage</th>
                      {customColumns.map((column) => (
                        <th key={column._id} className="px-3 py-2 font-semibold">
                          {column.label}
                        </th>
                      ))}
                      <th className="px-3 py-2 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length === 0 ? (
                      <tr>
                        <td
                          className="px-3 py-4 text-center text-sm font-medium text-gray-600"
                          colSpan={8 + customColumns.length}
                        >
                          Start tracking your jobs. Click "Add Row" to create a new application.
                        </td>
                      </tr>
                    ) : (
                      rows.map((row) => (
                        <tr
                          key={getRowKey(row)}
                          className={cn(
                            "border-b border-neutral-200 last:border-b-0",
                            row.isDraft ? "bg-amber-50/50" : "bg-white"
                          )}
                        >
                          <td className="px-3 py-2 text-neutral-900">
                            <div className="text-xs font-medium text-neutral-900">{row.company || "-"}</div>
                          </td>
                          <td className="px-3 py-2 text-neutral-900">
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-neutral-900">{row.title || "-"}</span>
                              {row.isDraft ? (
                                <span className="rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                                  Draft
                                </span>
                              ) : null}
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <select
                              value={row.status}
                              onChange={(event) =>
                                updateRowStatus(row, event.target.value as ApplicationStatus)
                              }
                              className="cursor-pointer rounded-full border-2 px-2 py-1 text-[11px] font-semibold text-black focus:outline-none"
                            >
                              <option value="Applied">Applied</option>
                              <option value="Interview">Interview</option>
                              <option value="Offer">Offer</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                          </td>
                          <td className="px-3 py-2 text-neutral-600">
                            {row.link ? (
                              <a
                                className="text-xs text-blue-600 hover:underline"
                                href={row.link.startsWith("http") ? row.link : `https://${row.link}`}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {row.link}
                              </a>
                            ) : (
                              <div className="text-xs text-neutral-400">-</div>
                            )}
                          </td>
                          <td className="px-3 py-2 text-neutral-700">
                            <div className="text-xs text-neutral-700">{row.contact || "-"}</div>
                          </td>
                          <td className="px-3 py-2 text-neutral-700">
                            <div className="text-xs text-neutral-700">{row.date || "-"}</div>
                          </td>
                          <td className="px-3 py-2 text-neutral-700">
                            <div className="text-xs text-neutral-700">{row.stage || "-"}</div>
                          </td>
                          {customColumns.map((column) => (
                            <td key={column._id} className="px-3 py-2 text-neutral-700">
                              <div className="text-xs text-neutral-700">
                                {(row.custom && row.custom[column._id]) || "-"}
                              </div>
                            </td>
                          ))}
                          <td className="flex gap-3 px-3 py-2">
                            {row.isDraft ? (
                              <button
                                type="button"
                                onClick={() => saveSingleDraft(row)}
                                disabled={!!row.isSaving}
                                className="mt-2 cursor-pointer text-[11px] font-semibold text-emerald-700 transition hover:text-emerald-900 disabled:cursor-not-allowed disabled:text-emerald-400"
                              >
                                {row.isSaving ? "Saving..." : "Save"}
                              </button>
                            ) : null}
                            <button
                              type="button"
                              onClick={() => openEditModal(row)}
                              className="mt-2 cursor-pointer text-[11px] font-semibold text-neutral-600 hover:text-neutral-900"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteRow(row)}
                              className="mt-2 cursor-pointer text-[11px] font-semibold text-red-500 transition hover:text-red-900"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {editingRow && editForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/50" onClick={closeEditModal} />
                  <div className="relative z-10 w-full max-w-2xl rounded-lg bg-white p-6">
                    <h3 className="mb-4 text-lg font-semibold text-neutral-900">
                      {editForm.isDraft ? "Edit Draft Application" : "Edit Application"}
                    </h3>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-neutral-700">Company</label>
                        <input
                          value={editForm.company || ""}
                          onChange={(e) => handleEditChange("company", e.target.value)}
                          className="w-full rounded border border-neutral-200 p-2 text-sm text-black"
                          placeholder="Acme Inc"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-neutral-700">Title *</label>
                        <input
                          value={editForm.title || ""}
                          onChange={(e) => handleEditChange("title", e.target.value)}
                          className="w-full rounded border border-neutral-200 p-2 text-sm text-black"
                          placeholder="Frontend Engineer"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-neutral-700">Link</label>
                        <input
                          value={editForm.link || ""}
                          onChange={(e) => handleEditChange("link", e.target.value)}
                          className="w-full rounded border border-neutral-200 p-2 text-sm text-black"
                          placeholder="https://..."
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-neutral-700">Contact</label>
                        <input
                          value={editForm.contact || ""}
                          onChange={(e) => handleEditChange("contact", e.target.value)}
                          className="w-full rounded border border-neutral-200 p-2 text-sm text-black"
                          placeholder="Recruiter name or email"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-neutral-700">Date</label>
                        <input
                          value={editForm.date || ""}
                          onChange={(e) => handleEditChange("date", e.target.value)}
                          className="w-full rounded border border-neutral-200 p-2 text-sm text-black"
                          placeholder="2026-03-01"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-neutral-700">Stage</label>
                        <input
                          value={editForm.stage || ""}
                          onChange={(e) => handleEditChange("stage", e.target.value)}
                          className="w-full rounded border border-neutral-200 p-2 text-sm text-black"
                          placeholder="Phone screen"
                        />
                      </div>
                    </div>
                    {customColumns.length > 0 && (
                      <div className="mt-4">
                        <h4 className="mb-2 text-sm font-medium text-neutral-800">Custom fields</h4>
                        <div className="grid gap-3">
                          {customColumns.map((col) => (
                            <div key={col._id}>
                              <label className="mb-1 block text-xs font-medium text-neutral-700">{col.label}</label>
                              <input
                                value={(editForm.custom && editForm.custom[col._id]) || ""}
                                onChange={(e) => handleEditCustomChange(col._id, e.target.value)}
                                className="w-full rounded border border-neutral-200 p-2 text-sm text-black"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="mt-6 flex justify-end gap-3">
                      <button
                        onClick={closeEditModal}
                        className="cursor-pointer rounded-md border border-neutral-200 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-800 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={saveEditedRow}
                        disabled={saveEditLoader}
                        className="cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-200"
                      >
                        {saveEditLoader ? "Saving..." : editForm.isDraft ? "Save Draft" : "Save"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="mt-4">
              <HrEmailsTable className="border-neutral-200 shadow-none" tableClassName="max-h-[320px]" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
