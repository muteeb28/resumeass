"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ActionButton } from "./ActionButton";
import { FormSection } from "./FormSection";
import type { ResumeEducation } from "@/types/portfolioly-resume";

export interface EducationFormProps {
  value: ResumeEducation[];
  onChange: (next: ResumeEducation[]) => void;
}

const emptyEdu: ResumeEducation = {
  institution: "",
  area: "",
  studyType: "",
  score: "",
  startDate: "",
  endDate: "",
  location: "",
  highlights: [],
};

export function EducationForm({ value, onChange }: EducationFormProps) {
  const items = value || [];

  const add = () => onChange([...items, { ...emptyEdu }]);
  const remove = (idx: number) => onChange(items.filter((_, i) => i !== idx));
  const update = (idx: number, next: Partial<ResumeEducation>) =>
    onChange(items.map((it, i) => (i === idx ? { ...it, ...next } : it)));

  return (
    <FormSection
      title="Education"
      actions={
        <ActionButton action="add" label="Add education" onClick={add} />
      }
    >
      <div className="grid gap-6">
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No education entries yet.
          </p>
        )}
        {items.map((ed, idx) => (
          <div key={idx} className="grid gap-4 p-4 rounded-md border">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Institution</Label>
                <Input
                  value={ed.institution ?? ""}
                  onChange={(e) => update(idx, { institution: e.target.value })}
                  placeholder="University"
                />
              </div>
              <div className="grid gap-2">
                <Label>Study Type</Label>
                <Input
                  value={ed.studyType ?? ""}
                  onChange={(e) => update(idx, { studyType: e.target.value })}
                  placeholder="Bachelor of Science"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Area / Field</Label>
                <Input
                  value={ed.area ?? ""}
                  onChange={(e) => update(idx, { area: e.target.value })}
                  placeholder="Computer Science"
                />
              </div>
              <div className="grid gap-2">
                <Label>Score / GPA</Label>
                <Input
                  value={ed.score ?? ""}
                  onChange={(e) => update(idx, { score: e.target.value })}
                  placeholder="3.8/4.0"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Location</Label>
                <Input
                  value={ed.location ?? ""}
                  onChange={(e) => update(idx, { location: e.target.value })}
                  placeholder="City, Country"
                />
              </div>
              <div className="grid gap-2">
                <Label>Graduation Date</Label>
                <Input
                  value={ed.endDate ?? ""}
                  onChange={(e) => update(idx, { endDate: e.target.value })}
                  placeholder="May 2024"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Honors / Details</Label>
              <Textarea
                rows={3}
                value={(ed.highlights ?? []).join("\n")}
                onChange={(e) =>
                  update(idx, {
                    highlights: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean),
                  })
                }
                placeholder={"Dean's List (All Semesters)\nCum. cGPA: 8.2/10.0"}
              />
              <p className="text-xs text-muted-foreground">One item per line</p>
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
