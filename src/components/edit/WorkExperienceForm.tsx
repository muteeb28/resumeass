"use client";

import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ActionButton } from "./ActionButton";
import { FormSection } from "./FormSection";
import type { ResumeWork } from "@/types/portfolioly-resume";

export interface WorkExperienceFormProps {
  value: ResumeWork[];
  onChange: (next: ResumeWork[]) => void;
}

const emptyWork: ResumeWork = {
  company: "",
  position: "",
  startDate: "",
  endDate: "",
  highlights: [],
};

export function WorkExperienceForm({
  value,
  onChange,
}: WorkExperienceFormProps) {
  const items = value || [];
  const canAdd = useMemo(() => items.length < 10, [items.length]);

  const add = () => onChange([...items, { ...emptyWork }]);
  const remove = (idx: number) => onChange(items.filter((_, i) => i !== idx));
  const update = (idx: number, next: Partial<ResumeWork>) =>
    onChange(items.map((it, i) => (i === idx ? { ...it, ...next } : it)));

  return (
    <FormSection
      title="Work Experience"
      actions={
        <ActionButton
          action="add"
          label="Add experience"
          onClick={add}
          disabled={!canAdd}
        />
      }
    >
      <div className="grid gap-6">
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No experiences added yet.
          </p>
        )}
        {items.map((exp, idx) => (
          <div key={idx} className="grid gap-4 p-4 rounded-md border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Company</Label>
                <Input
                  value={exp.company ?? ""}
                  onChange={(e) =>
                    update(idx, { company: e.target.value })
                  }
                  placeholder="Company Inc."
                />
              </div>
              <div className="grid gap-2">
                <Label>Position</Label>
                <Input
                  value={exp.position ?? ""}
                  onChange={(e) => update(idx, { position: e.target.value })}
                  placeholder="Software Engineer"
                />
              </div>
              <div className="grid gap-2">
                <Label>Start Date</Label>
                <Input
                  value={exp.startDate ?? ""}
                  onChange={(e) => update(idx, { startDate: e.target.value })}
                  placeholder="Jan 2020"
                />
              </div>
              <div className="grid gap-2">
                <Label>End Date</Label>
                <Input
                  value={exp.endDate ?? ""}
                  onChange={(e) => update(idx, { endDate: e.target.value })}
                  placeholder="Present"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Highlights (one per line)</Label>
              <Textarea
                rows={4}
                value={exp.highlights?.join('\n') ?? ""}
                onChange={(e) => update(idx, { highlights: e.target.value.split('\n').filter(b => b.trim()) })}
                placeholder="- Led development of key features&#10;- Improved performance by 40%&#10;- Mentored junior developers"
              />
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
