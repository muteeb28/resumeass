"use client";

import type { ResumeJSON } from "@/types/resume";
import TemplateSplit from "./TemplateSplit";

export default function Template02({ resume }: { resume: ResumeJSON }) {
  return <TemplateSplit resume={resume} />;
}
