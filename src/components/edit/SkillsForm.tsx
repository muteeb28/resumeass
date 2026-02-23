"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TagInput } from "./TagInput";
import { ActionButton } from "./ActionButton";
import { FormSection } from "./FormSection";
import type { ResumeSkill } from "@/types/portfolioly-resume";

export interface SkillsFormProps {
  value: ResumeSkill[];
  onChange: (next: ResumeSkill[]) => void;
}

const emptySkill: ResumeSkill = {
  name: "",
  keywords: [],
};

export function SkillsForm({ value, onChange }: SkillsFormProps) {
  const items = value || [];
  const add = () => onChange([...items, { ...emptySkill }]);
  const remove = (idx: number) => onChange(items.filter((_, i) => i !== idx));
  const update = (idx: number, next: Partial<ResumeSkill>) =>
    onChange(items.map((it, i) => (i === idx ? { ...it, ...next } : it)));

  return (
    <FormSection
      title="Skills"
      actions={
        <ActionButton action="add" label="Add skill category" onClick={add} />
      }
    >
      <div className="grid gap-6">
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No skill categories added yet.
          </p>
        )}
        {items.map((skillCat, idx) => (
          <div key={idx} className="grid gap-4 p-4 rounded-md border">
            <div className="grid gap-2">
              <Label>Category Name</Label>
              <Input
                value={skillCat.name ?? ""}
                onChange={(e) => update(idx, { name: e.target.value })}
                placeholder="Programming Languages"
              />
            </div>

            <div className="grid gap-2">
              <Label>Skills</Label>
              <TagInput
                value={skillCat.keywords || []}
                onChange={(tags) => update(idx, { keywords: tags })}
                placeholder="Type skill, then press Enter or comma"
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
