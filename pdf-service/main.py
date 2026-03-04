import os
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, HTTPException

from extractor import extract_text
from models import ExtractResponse

load_dotenv()

app = FastAPI(title="PDF Resume Extractor")


@app.get("/health")
async def health():
    return {"status": "ok", "service": "pdf-resume-extractor"}


@app.post("/extract", response_model=ExtractResponse)
async def extract(file: UploadFile = File(...)):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    pdf_bytes = await file.read()
    if not pdf_bytes:
        raise HTTPException(status_code=400, detail="Empty file")

    try:
        raw_text, page_count = extract_text(pdf_bytes)
        return ExtractResponse(rawText=raw_text, pageCount=page_count)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF extraction failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PDF_SERVICE_PORT", "8100"))
    uvicorn.run(app, host="0.0.0.0", port=port)
