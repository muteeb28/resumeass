"use client";

import type { ResumeJSON } from "@/types/resume";
import TemplateClassic from "./TemplateClassic";

export default function Template01({ resume }: { resume: ResumeJSON }) {
  return <TemplateClassic resume={resume} />;
}
