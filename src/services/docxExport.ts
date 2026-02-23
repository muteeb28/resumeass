import type { ResumeJSON } from "../types/resume";
import { buildApiUrl } from "./resumeOptimizerApi";

const getNetworkErrorMessage = (error: unknown) => {
  if (error instanceof TypeError && /fetch/i.test(error.message)) {
    return "Unable to reach the API. Start the backend server and confirm VITE_API_URL or the /api proxy is correct.";
  }
  return "Unable to reach the API.";
};

export async function exportResumeDocx(
  resume: ResumeJSON,
  filename = "resume.docx",
  template: "classic" | "split" = "classic"
) {
  let response: Response;
  try {
    response = await fetch(buildApiUrl("generate-docx"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resume, template }),
    });
  } catch (error) {
    throw new Error(getNetworkErrorMessage(error));
  }

  if (!response.ok) {
    throw new Error("DOCX generation failed");
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
