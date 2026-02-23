"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ActionButton } from "./ActionButton";
import { FormSection } from "./FormSection";
import type { ResumeCertification } from "@/types/resume";

export interface CertificationsFormProps {
  value: ResumeCertification[];
  onChange: (next: ResumeCertification[]) => void;
}

const emptyCert: ResumeCertification = { name: "", issuer: "", date: "" };

export function CertificationsForm({
  value,
  onChange,
}: CertificationsFormProps) {
  const items = value || [];
  const add = () => onChange([...(items || []), { ...emptyCert }]);
  const remove = (idx: number) => onChange(items.filter((_, i) => i !== idx));
  const update = (idx: number, next: Partial<ResumeCertification>) =>
    onChange(items.map((it, i) => (i === idx ? { ...it, ...next } : it)));

  return (
    <FormSection
      title="Certifications"
      actions={
        <ActionButton action="add" label="Add certification" onClick={add} />
      }
    >
      <div className="grid gap-6">
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No certifications added yet.
          </p>
        )}
        {items.map((c, idx) => (
          <div key={idx} className="grid gap-4 p-4 rounded-md border">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label>Name</Label>
                <Input
                  value={c.name ?? ""}
                  onChange={(e) => update(idx, { name: e.target.value })}
                  placeholder="AWS Certified Developer"
                />
              </div>
              <div className="grid gap-2">
                <Label>Issuer</Label>
                <Input
                  value={c.issuer ?? ""}
                  onChange={(e) => update(idx, { issuer: e.target.value })}
                  placeholder="Amazon Web Services"
                />
              </div>
              <div className="grid gap-2">
                <Label>Date</Label>
                <Input
                  value={c.date ?? ""}
                  onChange={(e) => update(idx, { date: e.target.value })}
                  placeholder="Jan 2023"
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
