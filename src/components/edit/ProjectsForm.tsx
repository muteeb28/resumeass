"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ActionButton } from "./ActionButton";
import { FormSection } from "./FormSection";
import type { ResumeProject } from "@/types/portfolioly-resume";

export interface ProjectsFormProps {
  value: ResumeProject[];
  onChange: (next: ResumeProject[]) => void;
}

const emptyProject: ResumeProject = {
  name: "",
  description: "",
  entity: "",
  type: "",
  liveUrl: "",
  sourceUrl: "",
  highlights: [],
  startDate: "",
  endDate: "",
  role: "",
};

export function ProjectsForm({ value, onChange }: ProjectsFormProps) {
  const items = value || [];
  const add = () => onChange([...items, { ...emptyProject }]);
  const remove = (idx: number) => onChange(items.filter((_, i) => i !== idx));
  const update = (idx: number, next: Partial<ResumeProject>) =>
    onChange(items.map((it, i) => (i === idx ? { ...it, ...next } : it)));

  return (
    <FormSection
      title="Projects"
      actions={<ActionButton action="add" label="Add project" onClick={add} />}
    >
      <div className="grid gap-6">
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No projects added yet.
          </p>
        )}
        {items.map((p, idx) => (
          <div key={idx} className="grid gap-4 p-4 rounded-md border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Name</Label>
                <Input
                  value={p.name ?? ""}
                  onChange={(e) => update(idx, { name: e.target.value })}
                  placeholder="Portfolio Website"
                />
              </div>
              <div className="grid gap-2">
                <Label>Entity</Label>
                <Input
                  value={p.entity ?? ""}
                  onChange={(e) => update(idx, { entity: e.target.value })}
                  placeholder="Company or Organization"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Start Date</Label>
                <Input
                  value={p.startDate ?? ""}
                  onChange={(e) => update(idx, { startDate: e.target.value })}
                  placeholder="Sep 2025"
                />
              </div>
              <div className="grid gap-2">
                <Label>End Date</Label>
                <Input
                  value={p.endDate ?? ""}
                  onChange={(e) => update(idx, { endDate: e.target.value })}
                  placeholder="Present"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Role</Label>
              <Input
                value={p.role ?? ""}
                onChange={(e) => update(idx, { role: e.target.value })}
                placeholder="Solo Developer"
              />
            </div>

            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea
                rows={2}
                value={p.description ?? ""}
                onChange={(e) => update(idx, { description: e.target.value })}
                placeholder="Brief project description..."
              />
            </div>

            <div className="grid gap-2">
              <Label>Bullet Points</Label>
              <Textarea
                rows={4}
                value={(p.highlights ?? []).join("\n")}
                onChange={(e) =>
                  update(idx, {
                    highlights: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean),
                  })
                }
                placeholder="Launched AI-driven platform using TypeScript..."
              />
              <p className="text-xs text-muted-foreground">One bullet per line</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Live URL</Label>
                <Input
                  value={p.liveUrl ?? ""}
                  onChange={(e) => update(idx, { liveUrl: e.target.value })}
                  placeholder="https://myproject.com"
                />
              </div>
              <div className="grid gap-2">
                <Label>Source Code URL</Label>
                <Input
                  value={p.sourceUrl ?? ""}
                  onChange={(e) => update(idx, { sourceUrl: e.target.value })}
                  placeholder="https://github.com/user/repo"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <ActionButton
                action="remove"
                label="Remove"
                onClick={() => remove(idx)}
              />
            </div>
          </div>
        ))}
      </div>
    </FormSection>
  );
}
