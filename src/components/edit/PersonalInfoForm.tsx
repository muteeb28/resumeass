"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormSection } from "./FormSection";
import type { ResumeBasics } from "@/types/portfolioly-resume";

export interface PersonalInfoFormProps {
  value: ResumeBasics;
  onChange: (next: ResumeBasics) => void;
}

export function PersonalInfoForm({ value, onChange }: PersonalInfoFormProps) {
  const v = value || { name: "", email: "", phone: "", profiles: [] };
  return (
    <FormSection title="Personal Information">
      <div className="grid gap-2">
        <Label htmlFor="name">Full name</Label>
        <Input
          id="name"
          value={v.name ?? ""}
          onChange={(e) => onChange({ ...v, name: e.target.value })}
          placeholder="John Doe"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="headline">Headline</Label>
        <Input
          id="headline"
          value={v.headline ?? ""}
          onChange={(e) => onChange({ ...v, headline: e.target.value })}
          placeholder="Lead Mobile Developer & Flutter Engineer"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="summary">Summary</Label>
        <Textarea
          id="summary"
          value={v.summary ?? ""}
          onChange={(e) => onChange({ ...v, summary: e.target.value })}
          placeholder="Brief professional summary..."
          rows={4}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={v.email ?? ""}
            onChange={(e) => onChange({ ...v, email: e.target.value })}
            placeholder="john.doe@example.com"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={v.phone ?? ""}
            onChange={(e) => onChange({ ...v, phone: e.target.value })}
            placeholder="+1 555 0100"
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          value={v.location ?? ""}
          onChange={(e) => onChange({ ...v, location: e.target.value })}
          placeholder="San Francisco, CA"
        />
      </div>
    </FormSection>
  );
}
