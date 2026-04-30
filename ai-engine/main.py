from fastapi import FastAPI
from pydantic import BaseModel
import spacy

app = FastAPI()

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str
    risk_level: str
    extracted_symptoms: list[str]

@app.post("/analyze", response_model=ChatResponse)
async def analyze_symptoms(request: ChatRequest):
    # This is a placeholder for actual NLP and symptom analysis logic.
    # We will use spacy and the PDF logic here later.
    
    msg = request.message.lower()
    
    # Dummy logic based on simple keywords
    extracted_symptoms = []
    risk_level = "Low"
    reply = "I understand you are experiencing some discomfort. Please tell me more."
    
    if "pain" in msg or "headache" in msg:
        extracted_symptoms.append("pain")
        risk_level = "Medium"
        reply = "I noted that you are experiencing pain. How severe is it on a scale of 1 to 10?"
    
    if "bleeding" in msg or "chest" in msg:
        extracted_symptoms.append(msg)
        risk_level = "High"
        reply = "You mentioned a potentially serious symptom. I recommend seeking immediate medical attention."
        
    return ChatResponse(
        reply=reply,
        risk_level=risk_level,
        extracted_symptoms=extracted_symptoms
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
