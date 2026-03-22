from fastapi import FastAPI

app = FastAPI(title="BlackRoad OS API")


@app.get("/")
async def root():
    return {"message": "Welcome to BlackRoad OS"}


@app.get("/health")
async def health():
    return {"status": "ok", "service": "core"}
