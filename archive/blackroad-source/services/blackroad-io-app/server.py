# api/server.py

"""
Lucidia API Server – WebSocket + REST
Exposes Roadie and Guardian functions via simple endpoints
"""

from fastapi import FastAPI, WebSocket
from fastapi.responses import JSONResponse
from agents.roadie import Roadie
from agents.guardian import Guardian
import uvicorn

app = FastAPI()
roadie = Roadie()
guardian = Guardian()

@app.get("/")
def home():
    return {"status": "Lucidia API online"}

@app.get("/search/{query}")
def search(query: str):
    results = roadie.search(query)
    return JSONResponse(content={"results": results})

@app.get("/audit")
def audit():
    result = guardian.verify_integrity()
    return JSONResponse(content={"audit": result})

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    await websocket.send_text("🧠 Lucidia WebSocket channel ready.")
    while True:
        data = await websocket.receive_text()
        results = roadie.search(data)
        await websocket.send_json({"query": data, "matches": results})

if __name__ == "__main__":
    print("🚀 Running Lucidia API at http://localhost:8000")
    uvicorn.run("api.server:app", host="0.0.0.0", port=8000, reload=True)

