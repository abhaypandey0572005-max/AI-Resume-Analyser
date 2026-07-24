import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def analyze_resume(resume_text):
    model = genai.GenerativeModel("gemini-3.5-flash-lite")

    prompt = f"""
    You are an expert resume reviewer. Analyze the following resume text and return ONLY a valid JSON object (no markdown, no extra text) with this exact structure:

    {{
        "overall_score": <number out of 100>,
        "skills_found": [<list of skills found in resume>],
        "strengths": [<list of 3-5 strengths>],
        "weaknesses": [<list of 3-5 areas to improve>],
        "suggestions": [<list of 3-5 actionable suggestions>]
    }}

    Resume text:
    {resume_text}
    """

    response = model.generate_content(prompt)
    raw_text = response.text.strip()

    # Gemini kabhi kabhi ```json ... ``` me wrap karta hai, usse clean karo
    if raw_text.startswith("```"):
        raw_text = raw_text.split("```")[1]
        if raw_text.startswith("json"):
            raw_text = raw_text[4:]

    try:
        result = json.loads(raw_text)
    except json.JSONDecodeError:
        result = {"error": "AI response ko parse nahi kar paye", "raw": raw_text}

    return result