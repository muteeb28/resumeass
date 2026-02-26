import { useEffect, useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
  IconLayoutDashboard,
  IconSettings,
  IconUsers,
  IconChartLine,
} from "@tabler/icons-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import HrEmailsTable from "./hr-emails-table";
import toast from "react-hot-toast";

export default function SidebarDemo() {
  const links = [
    {
      label: "Dashboard",
      href: "/login",
      icon: (
        <IconLayoutDashboard className="h-5 w-5 shrink-0 text-neutral-600" />
      ),
    },
    {
      label: "Users",
      href: "/login",
      icon: (
        <IconUsers className="h-5 w-5 shrink-0 text-neutral-600" />
      ),
    },
    {
      label: "Reports",
      href: "/login",
      icon: (
        <IconChartLine className="h-5 w-5 shrink-0 text-neutral-600" />
      ),
    },
    {
      label: "Settings",
      href: "/login",
      icon: (
        <IconSettings className="h-5 w-5 shrink-0 text-neutral-600" />
      ),
    },
  ];
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    const getJobApplications = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/job/applications`);
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data.applications) && data.applications.length > 0) {
            setRows(data.applications);
          }
        }
      } catch (error) {
        console.log('some error occured while fetching job applications', error);
      }
    }

    getJobApplications();
  }, []);
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-7xl flex-1 flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 md:flex-row",
        "h-[60vh]", // for your use case, use `h-screen` instead of `h-[60vh]`
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10 border-r border-neutral-200 bg-white">
          <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
          <div>
            <SidebarLink
              link={{
                label: "User",
                href: "/login",
                icon: (
                  <div className="h-7 w-7 shrink-0 rounded-full bg-neutral-300 text-[11px] font-semibold text-neutral-700 flex items-center justify-center">
                    U
                  </div>
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>
      <Dashboard rows={rows} setRows={setRows} />
    </div>
  );
}
export const Logo = () => {
  return (
    <a
      href="#"
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-neutral-900"
    >
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-neutral-900" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium whitespace-pre text-neutral-900"
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
      <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-neutral-900" />
    </a>
  );
};

const Dashboard = ({ rows, setRows }: { rows: any[], setRows: (newRows: any) => void }) => {
  const [view, setView] = useState<"tracker" | "emails">("tracker");

  type ApplicationStatus = "Offer" | "Rejected" | "Interview" | "Applied";
  type EditableField = "company" | "title" | "link" | "contact" | "date" | "stage";
  type CustomColumn = { id: string; label: string };

  const createId = (prefix: string) =>
    `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;



  const [customColumns, setCustomColumns] = useState<CustomColumn[]>([]);
  const [newlyAddedRows, setNewlyAddedRows] = useState<any[]>([]);
  const [saveLoader, setSaveLoader] = useState(false);
  const [saveEditLoader, setSaveEditLoader] = useState(false);

  const addRow = () => {
    const custom = customColumns.reduce<Record<string, string>>((acc, column) => {
      acc[column.id] = "";
      return acc;
    }, {});

    const newRowId = createId("row");
    setRows((prev: any[]) => [
      ...prev,
      {
        id: newRowId,
        company: "",
        title: "",
        status: "Applied",
        link: "",
        contact: "",
        date: "",
        stage: "",
        custom,
      },
    ]);

    setNewlyAddedRows((prev) => [
      ...prev,
      {
        id: newRowId,
        company: "",
        title: "",
        status: "Applied",
        link: "",
        contact: "",
        date: "",
        stage: "",
        custom,
      },
    ]);
  };

  const saveRow = async () => {
    // Saving row to the db
    if (newlyAddedRows.length === 0) {
      toast.error("No new applications to save. Please add a new application before saving.");
      return;
    }
    try {
      console.log('saving applications: ', newlyAddedRows);
      setSaveLoader(true);
      const result = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/job/applications`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ applications: newlyAddedRows }),
      });
      const data = await result.json();
      if (result.ok) {
        setNewlyAddedRows([]);
        toast.success("Applications saved successfully!");
      } else {
        toast.error(data.message || "Failed to save applications.");
      }
    } catch (error) {
      console.error("Error saving application:", error);
      toast.error("Failed to save applications.");
    } finally {
      setSaveLoader(false);
    }
  }

  const deleteRow = async (rowId: string) => {
    try {
      const isNewlyAddedRow = newlyAddedRows.some((row) => row.id === rowId);
      if (isNewlyAddedRow) {
        setRows((prev: any[]) => prev.filter((row: any) => row.id !== rowId));
        setNewlyAddedRows((prev) => prev.filter((row) => row.id !== rowId));
        toast.success("application deleted successfully");
        return;
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/job/application/delete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: rowId })
      });
      const result = await response.json();
      if (!response.ok) {
        toast.error(result.message || "failed to delete application");
        return;
      }
      setRows((prev: any[]) => prev.filter((row: any) => row.id !== rowId));
      setNewlyAddedRows((prev) => prev.filter((row) => row.id !== rowId));
      toast.success("application deleted successfully");
    }
    catch (error: any) {
      toast.error("failed to delete application. Try again later", error);
      return;
    }
  };



  const updateRowStatus = async (rowId: string, status: ApplicationStatus) => {
    try {
      const isNewlyAddedRow = newlyAddedRows.some((row) => row.id === rowId);
      if (isNewlyAddedRow) {
        toast.error("Please save the application before updating its status.");
        return;
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/job/application/status/update/${rowId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),

      });
      const result = await response.json();
      if (!response.ok) {
        toast.error(result.message || "failed to update application");
        return;
      }
      setRows((prev: any[]) =>
        prev.map((row: any) => (row.id === rowId ? { ...row, status } : row))
      );
      setNewlyAddedRows((prev) =>
        prev.map((row) => (row.id === rowId ? { ...row, status } : row))
      );
      toast.success("application status updated successfully.");
    }
    catch (error: any) {
      toast.error('failed to update application. Try again later', error);
    }
  };



  const addColumn = () => {
    const id = createId("column");
    setCustomColumns((prev) => [...prev, { id, label: "New Column" }]);
    setRows((prev: any[]) =>
      prev.map((row: any) => ({
        ...row,
        custom: { ...row.custom, [id]: "" },
      }))
    );
  };



  // Edit modal state
  const [editingRow, setEditingRow] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<any | null>(null);

  const openEditModal = (row: any) => {
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
    try {
      setSaveEditLoader(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/job/applications/${editForm.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ application: editForm }),
      });
      const result = await response.json();
      if (!response.ok) {
        toast.error(result.message || "failed to update application");
        return;
      }
      toast.success("application updated successfully");
      setRows((prev: any[]) => prev.map((r: any) => (r.id === editForm.id ? editForm : r)));
      setNewlyAddedRows((prev) => prev.map((r) => (r.id === editForm.id ? editForm : r)));
      closeEditModal();
    }
    catch (error: any) {
      toast.error('failed to update application. Try again later', error);
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
              <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-400">
                Workspace
              </p>
              <p className="text-lg font-semibold text-neutral-900">
                Job Tracker Preview
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 p-1">
              <div className="px-2 py-2">
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = "/login";
                  }}
                  className="rounded-full border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400 cursor-pointer"
                >
                  Unlock 1,800 HR profiles
                </button>
              </div>
              <button
                type="button"
                onClick={() => setView("tracker")}
                className={cn(
                  "px-4 py-1.5 rounded-full text-[11px] font-semibold transition",
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
                  "px-4 py-1.5 rounded-full text-[11px] font-semibold transition",
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
                  <p className="text-sm font-semibold text-neutral-900">
                    Job Applications Tracker
                  </p>
                  <p className="text-xs text-neutral-500">
                    Track and manage all your job applications in one place.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={saveRow}
                    disabled={saveLoader || newlyAddedRows.length === 0}
                    className="cursor-pointer inline-flex h-8 items-center rounded-md border border-blue-200 bg-blue-600 px-2.5 text-[11px] font-semibold text-white transition hover:border-blue-700 disabled:bg-blue-100 disable:opacity-50"
                  >
                    Save Rows
                  </button>
                  <button
                    type="button"
                    onClick={addRow}
                    className="inline-flex h-8 items-center rounded-md border border-neutral-200 bg-white px-2.5 text-[11px] font-semibold text-neutral-700 transition hover:border-neutral-300"
                  >
                    Add card
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
                        <th key={column.id} className="px-3 py-2 font-semibold">{column.label}</th>
                      ))}
                      <th className="px-3 py-2 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows?.length === 0 ? <p className="my-4 text-center font-bold text-sm text-gray-600">start tracking your job. Click on the add card on the top right of the table.</p> : rows.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-neutral-200 last:border-b-0"
                      >
                        <td className="px-3 py-2 text-neutral-900">
                          <div className="text-xs font-medium text-neutral-900">{row.company || '-'}</div>
                        </td>
                        <td className="px-3 py-2 text-neutral-900">
                          <div className="text-xs text-neutral-900">{row.title || '-'}</div>
                        </td>
                        <td className="px-3 py-2">
                          <select
                            value={row.status}
                            onChange={(event) =>
                              updateRowStatus(row.id, event.target.value as ApplicationStatus)
                            }
                            className={cn(
                              "rounded-full px-2 py-1 text-[11px] font-semibold focus:outline-none text-black border-2 cursor-pointer",
                            )}
                          >
                            <option value="Offer">Offer</option>
                            <option value="Rejected">Rejected</option>
                            <option value="Interview">Interview</option>
                            <option value="Applied">Applied</option>
                          </select>
                        </td>
                        <td className="px-3 py-2 text-neutral-600">
                          {row.link ? (
                            <a className="text-xs text-blue-600 hover:underline" href={row.link.startsWith('http') ? row.link : `https://${row.link}`} target="_blank" rel="noreferrer">{row.link}</a>
                          ) : (
                            <div className="text-xs text-neutral-400">-</div>
                          )}
                        </td>
                        <td className="px-3 py-2 text-neutral-700">
                          <div className="text-xs text-neutral-700">{row.contact || '-'}</div>
                        </td>
                        <td className="px-3 py-2 text-neutral-700">
                          <div className="text-xs text-neutral-700">{row.date || '-'}</div>
                        </td>
                        <td className="px-3 py-2 text-neutral-700">
                          <div className="text-xs text-neutral-700">{row.stage || '-'}</div>
                        </td>
                        {customColumns.map((column) => (
                          <td key={column.id} className="px-3 py-2 text-neutral-700">
                            <div className="text-xs text-neutral-700">{(row.custom && row.custom[column.id]) || '-'}</div>
                          </td>
                        ))}
                        <td className="px-3 py-2 flex gap-3">
                          <button
                            type="button"
                            onClick={() => openEditModal(row)}
                            className="text-[11px] font-semibold text-neutral-600 hover:text-neutral-900 cursor-pointer mt-2"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteRow(row.id)}
                            className="text-[11px] font-semibold text-red-500 transition hover:text-red-900 cursor-pointer mt-2"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Edit Modal */}
              {editingRow && editForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/50" onClick={closeEditModal} />
                  <div className="relative z-10 w-full max-w-2xl rounded-lg bg-white p-6">
                    <h3 className="mb-4 text-lg font-semibold text-neutral-900">Edit Application</h3>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-neutral-700">Company</label>
                        <input value={editForm.company || ''} onChange={(e) => handleEditChange('company', e.target.value)} className="w-full rounded border border-neutral-200 p-2 text-sm text-black" />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-neutral-700">Title</label>
                        <input value={editForm.title || ''} onChange={(e) => handleEditChange('title', e.target.value)} className="w-full rounded border border-neutral-200 p-2 text-sm text-black" />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-neutral-700">Link</label>
                        <input value={editForm.link || ''} onChange={(e) => handleEditChange('link', e.target.value)} className="w-full rounded border border-neutral-200 p-2 text-sm text-black" />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-neutral-700">Contact</label>
                        <input value={editForm.contact || ''} onChange={(e) => handleEditChange('contact', e.target.value)} className="w-full rounded border border-neutral-200 p-2 text-sm text-black" />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-neutral-700">Date</label>
                        <input value={editForm.date || ''} onChange={(e) => handleEditChange('date', e.target.value)} className="w-full rounded border border-neutral-200 p-2 text-sm text-black" />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-neutral-700">Stage</label>
                        <input value={editForm.stage || ''} onChange={(e) => handleEditChange('stage', e.target.value)} className="w-full rounded border border-neutral-200 p-2 text-sm text-black" />
                      </div>
                    </div>
                    {customColumns.length > 0 && (
                      <div className="mt-4">
                        <h4 className="mb-2 text-sm font-medium text-neutral-800">Custom fields</h4>
                        <div className="grid gap-3">
                          {customColumns.map((col) => (
                            <div key={col.id}>
                              <label className="mb-1 block text-xs font-medium text-neutral-700">{col.label}</label>
                              <input value={(editForm.custom && editForm.custom[col.id]) || ''} onChange={(e) => handleEditCustomChange(col.id, e.target.value)} className="w-full rounded border border-neutral-200 p-2 text-sm text-black" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="mt-6 flex justify-end gap-3">
                      <button onClick={closeEditModal} className="rounded-md border border-neutral-200 px-4 py-2 text-sm text-neutral-700 cursor-pointer hover:bg-neutral-800 hover:text-white">Cancel</button>
                      <button onClick={saveEditedRow} disabled={saveEditLoader} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white cursor-pointer hover:bg-blue-700">Save</button>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="mt-4">
              <HrEmailsTable
                className="border-neutral-200 shadow-none"
                tableClassName="max-h-[320px]"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
