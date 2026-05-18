import "server-only";
import { NextRequest } from "next/server";
import { Readable } from "stream";
import axiosInstance from "@/lib/axios";

export async function POST(req: NextRequest) {
  try {
    const incomingFormData = await req.formData();

    // 1. Instantiate the native Node.js/Web FormData object
    const axiosFormData = new FormData();

    // 2. Safely cycle through fields and map them
    for (const [key, value] of incomingFormData.entries()) {
      if (value instanceof File) {
        // Explicitly preserve the file binary structure, its name, and its MIME type
        axiosFormData.append(key, value, value.name);
      } else {
        axiosFormData.append(key, value);
      }
    }

    // 3. Request the upstream streaming engine using Axios
    const response = await axiosInstance.post("optimize-resume-stream", axiosFormData, {
      responseType: "stream",
      headers: {
        "Accept": "text/event-stream",
        "Content-Type": undefined,
      },
    });

    // 4. Construct a standard Web-readable stream pipeline out of the Node emitter
    const nodeStream = response.data as Readable;
    const webStream = new ReadableStream({
      start(controller) {
        nodeStream.on("data", (chunk) => controller.enqueue(chunk));
        nodeStream.on("end", () => controller.close());
        nodeStream.on("error", (err) => controller.error(err));
      },
      cancel() {
        nodeStream.destroy();
      }
    });

    return new Response(webStream, {
      status: response.status,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });

  } catch (error: any) {
    // This console log will now print the exact validation array throwing the 400 from your backend
    console.error("Downstream Backend 400 Error Payload:", error.response?.data);
    
    return new Response(
      JSON.stringify({ 
        error: "Streaming optimization sequence interrupted.",
        details: error.response?.data || error.message 
      }), 
      { 
        status: error.response?.status || 400, 
        headers: { "Content-Type": "application/json" } 
      }
    );
  }
}