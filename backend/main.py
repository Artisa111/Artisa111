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

from typing import List, Dict

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    history: List[Message]
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

async def call_llm_api(history: List[Dict[str, str]], user_message: str, data: list) -> tuple[str, dict | None]:
    """
    TODO: Integrate real OpenAI/Claude API here.
    This function currently mocks the AI response for the MVP.
    Future implementation should:
    1. Pass the full `history` to the LLM to maintain context.
    2. Provide the `data` in the system prompt.
    3. Ask the LLM to return a structured JSON with 'response' and 'action'.
    4. Implement robust try/except blocks for rate limits and API failures.
    """
    msg = user_message.lower()

    try:
        # Mock logic based on keywords
        if "best table" in msg or "highest revenue" in msg:
            df = pd.DataFrame(data)
            best_table = df.loc[df['revenue_today_ils'].idxmax()]
            return (
                f"The best performing table today is {best_table['table_id']} with a revenue of {best_table['revenue_today_ils']} ILS.",
                {"type": "HIGHLIGHT_TABLE", "table_id": best_table['table_id']}
            )

        if "empty" in msg or "available" in msg:
             return (
                "I will highlight all the available tables for you.",
                {"type": "HIGHLIGHT_EMPTY_TABLES"}
             )

        if "english" in msg:
             return (
                "Highlighting tables where English is the primary language.",
                {"type": "HIGHLIGHT_LANGUAGE", "language": "English"}
             )

        # Default fallback
        return (
            "I'm not sure how to answer that yet, but I'm ready to learn! Try asking about the 'best table' or 'empty tables'.",
            None
        )
    except Exception as e:
        # Proper error handling mock
        print(f"Error in LLM processing: {e}")
        return ("Sorry, I encountered an internal error while processing the data.", None)


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        # 1. Load context data
        if not os.path.exists(DATA_FILE):
             raise HTTPException(status_code=404, detail="Data file not found")

        df = pd.read_csv(DATA_FILE)
        data_records = df.to_dict(orient="records")

        # 2. Format history
        formatted_history = [{"role": msg.role, "content": msg.content} for msg in request.history]

        # 3. Call AI function (currently mocked, ready for OpenAI)
        response_text, action_dict = await call_llm_api(formatted_history, request.message, data_records)

        return ChatResponse(
            response=response_text,
            action=action_dict
        )
    except Exception as e:
        # Top-level API error handling
        print(f"Chat API Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to process chat request")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
