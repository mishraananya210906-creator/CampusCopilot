import io
from typing import Optional
from pypdf import PdfReader

def extract_text_from_pdf_bytes(pdf_bytes: bytes) -> str:
    """Extracts text content from PDF file bytes using pypdf."""
    try:
        reader = PdfReader(io.BytesIO(pdf_bytes))
        extracted_pages = []
        for i, page in enumerate(reader.pages):
            text = page.extract_text()
            if text:
                extracted_pages.append(f"--- Page {i + 1} ---\n{text.strip()}")
        full_text = "\n\n".join(extracted_pages)
        return full_text if full_text.strip() else "No readable text found in the PDF."
    except Exception as e:
        return f"Error extracting PDF content: {str(e)}"

def truncate_for_context(text: str, max_chars: int = 12000) -> str:
    """Truncates text to fit safely within LLM context window while preserving core content."""
    if len(text) <= max_chars:
        return text
    half = max_chars // 2
    return text[:half] + "\n\n[... content truncated for optimal context ...]\n\n" + text[-half:]
