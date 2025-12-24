import fitz  # PyMuPDF
import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Check for API Key
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GEMINI_API_KEY not found in .env file")

genai.configure(api_key=api_key)

def extract_code_from_pdf(pdf_bytes: bytes) -> str:
    try:
        # 1. Read PDF
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        text_content = ""
        for page in doc:
            text_content += page.get_text()
        
        if not text_content:
            return "# ERROR: Could not extract text from this PDF."

        # 2. Configure Model with Safety Settings disabled (to prevent blocking)
        model = genai.GenerativeModel('gemini-1.5-pro')
        
        # Unsafe content is rare in finance papers, but default filters are strict.
        safety_settings = [
            {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
            {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
        ]

        prompt = f"""
        You are a Quantitative Financial Engineer. 
        Analyze the following academic paper text and extract the core trading logic.
        
        Output a SINGLE Python class named 'AlphaStrategy' that inherits from 'BaseStrategy'.
        The class must have:
        1. `__init__`: Define parameters (lookback_period, z_score_threshold, etc.).
        2. `generate_signal(df)`: A method that takes a Pandas DataFrame (with 'Close', 'High', 'Low') and returns a signal (1 for Buy, -1 for Sell, 0 for Hold).
        
        Strict Rules:
        - Output ONLY valid Python code. No Markdown ticks (```), no explanations.
        - Use 'pandas' and 'numpy'.
        - Assume 'BaseStrategy' exists.
        
        PAPER TEXT:
        {text_content[:30000]} 
        """
        
        response = model.generate_content(prompt, safety_settings=safety_settings)
        
        # Check if response was blocked
        if not response.parts:
            print("Gemini blocked the response:", response.prompt_feedback)
            return "# ERROR: AI Blocked the response due to safety filters."

        # Clean up markdown
        code = response.text.replace("```python", "").replace("```", "").strip()
        return code

    except Exception as e:
        print(f"VLM Engine Error: {str(e)}")
        # Return the error as a comment so it shows up in the editor
        return f"# CRITICAL ERROR IN VLM ENGINE:\n# {str(e)}"