import os
from dotenv import load_dotenv
import google.generativeai as genai
from PIL import Image

load_dotenv()

genai.configure(api_key = os.getenv("GEMINI_API_KEY"))


class GeminiImageAnalyzer:
    def __init__(self):
        self.model = genai.GenerativeModel("gemini-2.5-flash")
    def analyze(self, image_path: str):
        try:
            image = Image.open(image_path)
            
            prompt = """
            Analyze this image carefully.

            1. Check if Google SynthID watermark is present.
            2. Determine whether the image appears REAL or AI-GENERATED.
            3. Explain your reasoning clearly in professional paragraph format.
            4. Mention any visual inconsistencies (lighting, edges, shadows, blending).
            5. Conclude with a final verdict.

            Provide a detailed explanation.
            """
            response = self.model.generate_content([prompt, image])
            return response.text
        
        except Exception as e:
            print(f"Error analyzing image: {str(e)}")
            return None