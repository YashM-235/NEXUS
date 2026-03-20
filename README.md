<div align="center">

<img src="https://capsule-render.vercel.app/api?type=venom&color=0:000000,40:0d0221,70:00f7ff15,100:7b2fff&height=220&section=header&text=NEXUS&fontSize=90&fontColor=00f7ff&fontAlignY=55&animation=twinkling&stroke=00f7ff&strokeWidth=2&desc=Intelligence%20from%202157%20%7C%20RAG-Powered%20Document%20Chatbot&descSize=18&descAlignY=75&descColor=ffffff"/>

<br>

<img src="https://readme-typing-svg.herokuapp.com?font=Orbitron&weight=700&size=20&duration=2500&pause=1000&color=00F7FF&center=true&vCenter=true&width=900&height=60&lines=RAG+%2B+LLM+%2B+Cinematic+UI;Feed+it+documents.+Ask+it+anything.;Powered+by+Groq+Llama+3.3+%7C+FAISS+%7C+LangChain;React+%2B+FastAPI+%7C+Full-Stack+AI" alt="Typing SVG" />

<br>

![Python](https://img.shields.io/badge/Python-000000?style=for-the-badge&logo=python&logoColor=00f7ff)
![FastAPI](https://img.shields.io/badge/FastAPI-000000?style=for-the-badge&logo=fastapi&logoColor=00d4a4)
![React](https://img.shields.io/badge/React-000000?style=for-the-badge&logo=react&logoColor=00f7ff)
![LangChain](https://img.shields.io/badge/LangChain-000000?style=for-the-badge&logo=chainlink&logoColor=00f7ff)
![Groq](https://img.shields.io/badge/Groq-000000?style=for-the-badge&logo=groq&logoColor=7b2fff)
![FAISS](https://img.shields.io/badge/FAISS-000000?style=for-the-badge&logo=meta&logoColor=00f7ff)

</div>

---

## `> cat ./overview.txt`

**NEXUS** is a full-stack RAG-powered chatbot with a cinematic futuristic identity. Feed it any document - PDFs, URLs, or plain text - and interrogate it through natural language. Every answer is grounded in your documents, streamed token by token, with source attribution.

The concept: an intelligence from 2157, transmitting knowledge back to the present. See you all soon..

---

## `> ls ./features`

```python
features = {
    "🎬 Cinematic UI"       : "Boot sequence with particle field, rotating rings, typewriter terminal",
    "📄 PDF Ingestion"      : "Multi-file upload, auto-chunked into FAISS vector store",
    "🌐 URL Ingestion"      : "Web scraping — paste any URL and interrogate it",
    "📝 Text Ingestion"     : "Paste raw content directly into NEXUS memory",
    "⚡ Streaming"          : "Token-by-token responses via Server-Sent Events",
    "📌 Source Attribution" : "Every answer shows exactly which document it came from",
    "🧠 Memory"             : "Last 20 exchanges remembered per session",
    "🗑️  Memory Wipe"       : "Full reset with one click",
    "🤖 NEXUS Persona"      : "Answers in character — intelligence from 2157",
}
```

---

## `> cat ./architecture.md`

```
NEXUS/
├── backend/                    # FastAPI + LangChain + FAISS
│   ├── main.py                 # API routes + global state management
│   ├── rag.py                  # RAG engine — ingest, retrieve, stream
│   ├── requirements.txt        # Pinned dependencies
│   └── .env                    # API key (local only)
└── frontend/                   # React 18 + Vite + Framer Motion
    ├── index.html              # Orbitron + Share Tech Mono fonts
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── App.jsx             # Intro → chat phase transition
        ├── styles/globals.css  # Scanlines, glows, grid, animations
        └── components/
            ├── NexusIntro.jsx       # Cinematic boot sequence
            ├── ChatInterface.jsx    # Main chat + sidebar
            ├── DocumentUpload.jsx   # Ingestion panel
            └── MessageBubble.jsx    # Futuristic message styling
```

---

## `> cat ./tech_stack.json`

<div align="center">

| Layer | Technology | Purpose |
|:------|:-----------|:--------|
| **Frontend** | React 18 + Vite | UI, routing, component architecture |
| **Animations** | Framer Motion | Cinematic transitions, boot sequence |
| **Backend** | FastAPI + Uvicorn | REST API, SSE streaming |
| **RAG Engine** | LangChain 0.3.x | Document pipeline, retrieval |
| **Vector Store** | FAISS (CPU) | Local embedding search |
| **Embeddings** | sentence-transformers/all-MiniLM-L6-v2 | Free, runs locally |
| **LLM** | Groq — Llama 3.3 70B Versatile | Free tier, fastest inference |
| **PDF Parsing** | PyPDF | Text extraction from PDFs |
| **URL Scraping** | LangChain WebBaseLoader | Ingest web pages |

</div>

---

## `> ./setup.sh`

### Prerequisites
- Python 3.10+
- Node.js 18+
- Groq API key → [console.groq.com](https://console.groq.com)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env file
echo "GROQ_API_KEY=gsk_your_key_here" > .env

# Run
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Open
```
http://localhost:5173
```

---

## `> ./demo.sh`

```bash
# 1. Watch the cinematic boot sequence fire up
# 2. Click  [ INITIALIZE UPLINK ]
# 3. Drop a PDF or paste a URL into the sidebar
# 4. Click  [ FEED NEXUS ]
# 5. Ask anything — watch tokens stream in real time
```

**Test queries after loading a document:**
```
"Summarize this document in 3 key points"
"What methodology was used?"
"What are the main conclusions?"
"Explain [any concept from your document]"
```

---

## `> cat ./api_endpoints.txt`

```
GET    /health         →  System status + vectorstore state
POST   /ingest/pdf     →  Upload one or more PDF files
POST   /ingest/text    →  Ingest plain text content
POST   /ingest/url     →  Scrape and ingest a URL
POST   /chat           →  Chat with streaming SSE response
DELETE /reset          →  Wipe all documents from memory
```

---

## `> cat ./env_setup.txt`

```bash
# backend/.env  — never commit this file
GROQ_API_KEY=gsk_your_key_here

# .gitignore
backend/venv/
backend/.env
__pycache__/
node_modules/
frontend/dist/
```

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:000000,50:00f7ff10,100:7b2fff&height=100&section=footer&text=NEXUS+%7C+2157&fontSize=16&fontColor=00f7ff&animation=twinkling&fontAlignY=70"/>

*Built by Yash — NEXUS, March 2026*

</div>
