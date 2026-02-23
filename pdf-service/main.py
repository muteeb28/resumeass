import os
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse

from extractor import extract_blocks
from classifier import classify_sections
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
        blocks, page_count, raw_text = extract_blocks(pdf_bytes)
        sections = classify_sections(blocks)

        return ExtractResponse(
            blocks=blocks,
            sections=sections,
            rawText=raw_text,
            pageCount=page_count,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF extraction failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PDF_SERVICE_PORT", "8100"))
    uvicorn.run(app, host="0.0.0.0", port=port)
