"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ActionButton } from "./ActionButton";
import { FormSection } from "./FormSection";
import type { ResumeAward } from "@/types/portfolioly-resume";

export interface AwardsFormProps {
  value: ResumeAward[];
  onChange: (next: ResumeAward[]) => void;
}

const emptyAward: ResumeAward = {
  title: "",
  date: "",
  awarder: "",
  summary: "",
};

export function AwardsForm({ value, onChange }: AwardsFormProps) {
  const items = value || [];
  const add = () => onChange([...items, { ...emptyAward }]);
  const remove = (idx: number) => onChange(items.filter((_, i) => i !== idx));
  const update = (idx: number, next: Partial<ResumeAward>) =>
    onChange(items.map((it, i) => (i === idx ? { ...it, ...next } : it)));

  return (
    <FormSection
      title="Awards"
      actions={<ActionButton action="add" label="Add award" onClick={add} />}
    >
      <div className="grid gap-6">
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No awards added yet.
          </p>
        )}
        {items.map((award, idx) => (
          <div key={idx} className="grid gap-4 p-4 rounded-md border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Title</Label>
                <Input
                  value={award.title ?? ""}
                  onChange={(e) => update(idx, { title: e.target.value })}
                  placeholder="Award name"
                />
              </div>
              <div className="grid gap-2">
                <Label>Date</Label>
                <Input
                  value={award.date ?? ""}
                  onChange={(e) => update(idx, { date: e.target.value })}
                  placeholder="2023"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Awarder</Label>
              <Input
                value={award.awarder ?? ""}
                onChange={(e) => update(idx, { awarder: e.target.value })}
                placeholder="Organization or institution"
              />
            </div>

            <div className="grid gap-2">
              <Label>Summary</Label>
              <Textarea
                rows={3}
                value={award.summary ?? ""}
                onChange={(e) => update(idx, { summary: e.target.value })}
                placeholder="Brief description of the award..."
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
