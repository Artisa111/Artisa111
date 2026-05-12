from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import json
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Allow CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATA_FILE = "restaurant_data.csv"

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
    action: dict | None = None

@app.get("/api/data")
async def get_data():
    try:
        if not os.path.exists(DATA_FILE):
            raise HTTPException(status_code=404, detail="Data file not found")

        df = pd.read_csv(DATA_FILE)
        # Convert NaN to None for JSON serialization if any
        df = df.where(pd.notnull(df), None)
        return df.to_dict(orient="records")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    # This is a mock AI endpoint.
    # In the future, you would use os.getenv("OPENAI_API_KEY") here and make an API call.

    # Mock logic based on keywords
    msg = request.message.lower()

    if "best table" in msg or "highest revenue" in msg:
        try:
            df = pd.read_csv(DATA_FILE)
            best_table = df.loc[df['revenue_today_ils'].idxmax()]
            return ChatResponse(
                response=f"The best performing table today is {best_table['table_id']} with a revenue of {best_table['revenue_today_ils']} ILS.",
                action={"type": "HIGHLIGHT_TABLE", "table_id": best_table['table_id']}
            )
        except Exception:
            pass

    if "empty" in msg or "available" in msg:
         return ChatResponse(
            response="I will highlight all the available tables for you.",
            action={"type": "HIGHLIGHT_EMPTY_TABLES"}
         )

    if "english" in msg:
         return ChatResponse(
            response="Highlighting tables where English is the primary language.",
            action={"type": "HIGHLIGHT_LANGUAGE", "language": "English"}
         )

    # Default fallback
    return ChatResponse(
        response="I'm not sure how to answer that yet, but I'm ready to learn! Try asking about the 'best table' or 'empty tables'.",
        action=None
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
