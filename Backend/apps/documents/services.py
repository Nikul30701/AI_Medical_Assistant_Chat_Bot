import json
import requests
from django.conf import settings
import pdfplumber
from PIL import Image
import pytesseract

SYSTEM_PROMPT = """
You are a medical document analyzer AI.

Analyze the given medical document text and respond ONLY in valid JSON format. Do not include any explanation or extra text.

Output format:
{
    "summary": "2-3 sentence plain English summary",
    "key_findings": ["finding 1", "finding 2"],
    "medications": ["medicine 1", "medicine 2"],
    "warnings": ["any abnormal values, risks, or concerning observations"]
}

Rules:
- Always return valid JSON (no trailing commas, no comments).
- If no data is available for a field, return an empty list [].
- Use simple, clear medical language.
- Extract only relevant medical information.
- Do not hallucinate data.
"""

def analyze_document_with_groq(document_text: str) -> tuple:
    """Call Groq API,  return (parsed_dict, raw_response_string)"""
    response = requests.post(
        'https://api.groq.com/openai/v1/chat/completions',
        headers={
            'Authorization': f"Bearer {settings.GROQ_API_KEY}",
            'Content-Type': 'application/json'
        },
        json={
            'model': settings.GROQ_MODEL,
            'messages': [
                {'role': 'system', 'content': SYSTEM_PROMPT},
                {'role': 'user', 'content': f"Analyze this medical document:\n\n{document_text}"},
            ],
            'temperature': 0.3,
            'max_tokens': 1000,
        },
        timeout=30,
    )
    response.raise_for_status()
    
    raw = response.json()['choices'][0]['message']['content']
    clean = raw.strip().removeprefix('```json').removeprefix('```').removesuffix('```').strip()
    return json.loads(clean), raw

def extract_text_from_file(file_obj, file_type: str) -> str:
    if file_type == 'pdf':
        with pdfplumber.open(file_obj)as pdf:
            return '\n'.join(page.extract_text() or '' for page in pdf.pages).strip()
        
    elif file_type == "image":
        img = Image.open(file_obj).convert('L')  # grayscale
        return pytesseract.image_to_string(img).strip()
    
    raise ValueError(f"Unsupported file type: {file_type}")