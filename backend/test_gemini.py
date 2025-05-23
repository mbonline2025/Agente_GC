import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()
genai.configure(api_key=os.getenv("VITE_GEMINI_API_KEY"))

modelo = genai.GenerativeModel("gemini-2.0-flash")
resposta = modelo.generate_content("Explique os princípios de governança do IBGC")
print(resposta.text)
