from pydantic import BaseModel


class ExtractResponse(BaseModel):
    rawText: str
    pageCount: int
