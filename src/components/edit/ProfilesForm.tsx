"use client";

import { useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ActionButton } from "./ActionButton";
import { FormSection } from "./FormSection";
import type { ResumeProfile } from "@/types/portfolioly-resume";

export interface ProfilesFormProps {
  value: ResumeProfile[];
  onChange: (next: ResumeProfile[]) => void;
}

const emptyProfile: ResumeProfile = {
  network: "",
  username: "",
  url: "",
};

export function ProfilesForm({ value, onChange }: ProfilesFormProps) {
  const items = value || [];
  const canAdd = useMemo(() => items.length < 10, [items.length]);

  const add = () => onChange([...items, { ...emptyProfile }]);
  const remove = (idx: number) => onChange(items.filter((_, i) => i !== idx));
  const update = (idx: number, next: Partial<ResumeProfile>) =>
    onChange(items.map((it, i) => (i === idx ? { ...it, ...next } : it)));

  return (
    <FormSection
      title="Social Profiles"
      actions={
        <ActionButton
          action="add"
          label="Add profile"
          onClick={add}
          disabled={!canAdd}
        />
      }
    >
      <div className="grid gap-6">
        {items.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No profiles added yet.
          </p>
        )}
        {items.map((profile, idx) => (
          <div key={idx} className="grid gap-4 p-4 rounded-md border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Network</Label>
                <Input
                  value={profile.network ?? ""}
                  onChange={(e) => update(idx, { network: e.target.value })}
                  placeholder="LinkedIn"
                />
              </div>
              <div className="grid gap-2">
                <Label>Username</Label>
                <Input
                  value={profile.username ?? ""}
                  onChange={(e) => update(idx, { username: e.target.value })}
                  placeholder="johndoe"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>URL</Label>
              <Input
                value={profile.url ?? ""}
                onChange={(e) => update(idx, { url: e.target.value })}
                placeholder="https://linkedin.com/in/johndoe"
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
