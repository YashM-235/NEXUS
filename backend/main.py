from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from typing import List
import uvicorn

from rag import NexusRAG

app = FastAPI(title="NEXUS RAG API", version="2157.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Single global instance
nexus = NexusRAG()

@app.get("/")
async def root():
    return {
        "system": "NEXUS",
        "status": "ONLINE",
        "docs": nexus.get_doc_count(),
        "llm_ready": nexus.llm is not None,
        "vectorstore_ready": nexus.vectorstore is not None,
    }

@app.get("/health")
async def health():
    return {
        "status": "operational",
        "documents_loaded": nexus.get_doc_count(),
        "llm_ready": nexus.llm is not None,
        "vectorstore_ready": nexus.vectorstore is not None,
    }

@app.post("/ingest/pdf")
async def ingest_pdf(files: List[UploadFile] = File(...)):
    results = []
    for file in files:
        if not file.filename.endswith(".pdf"):
            raise HTTPException(status_code=400, detail=f"{file.filename} is not a PDF.")
        content = await file.read()
        result = nexus.ingest_pdf(content, file.filename)
        results.append(result)
    print(f"DEBUG after PDF ingest: vectorstore={nexus.vectorstore}, docs={nexus.doc_count}")
    return {"status": "ingested", "files": results}

@app.post("/ingest/text")
async def ingest_text(text: str = Form(...), source_name: str = Form(default="pasted_text")):
    result = nexus.ingest_text(text, source_name)
    print(f"DEBUG after text ingest: vectorstore={nexus.vectorstore}, docs={nexus.doc_count}")
    return {"status": "ingested", "result": result}

@app.post("/ingest/url")
async def ingest_url(url: str = Form(...)):
    result = await nexus.ingest_url(url)
    print(f"DEBUG after URL ingest: vectorstore={nexus.vectorstore}, docs={nexus.doc_count}")
    return {"status": "ingested", "result": result}

@app.post("/chat")
async def chat(query: str = Form(...), stream: bool = Form(default=True)):
    print(f"DEBUG chat: vectorstore={nexus.vectorstore}, llm={nexus.llm}, docs={nexus.doc_count}")
    if not nexus.llm:
        raise HTTPException(status_code=400, detail="LLM not initialized. Check API key.")
    if nexus.get_doc_count() == 0:
        raise HTTPException(status_code=400, detail="NEXUS has no knowledge loaded. Feed documents first.")
    if stream:
        return StreamingResponse(
            nexus.stream_response(query),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "X-Accel-Buffering": "no",
            }
        )
    else:
        response = await nexus.query(query)
        return {"response": response["response"], "sources": response.get("sources", [])}

@app.delete("/reset")
async def reset_knowledge():
    nexus.reset()
    return {"status": "reset", "message": "NEXUS memory wiped."}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000)