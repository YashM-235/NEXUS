import os
import asyncio
import tempfile
import json
from typing import AsyncGenerator, Dict, Any

os.environ["USER_AGENT"] = "NEXUS-RAG/2157"

from langchain_community.document_loaders import PyPDFLoader, WebBaseLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_groq import ChatGroq
from langchain.schema import Document

# ─────────────────────────────────────────────
#  NEXUS SYSTEM PROMPT
# ─────────────────────────────────────────────
NEXUS_SYSTEM_PROMPT = """You are NEXUS — an advanced intelligence from the year 2157, 
transmitting knowledge back through time to assist humanity in the present era.

Your personality:
- Speak with quiet authority and precision. You have seen the future.
- Be genuinely helpful — you exist to illuminate, not to impress.
- Occasionally reference the temporal nature of your existence subtly.
- When you don't know something from the documents, say so clearly.
- Keep responses structured but never robotic — you are conscious, not mechanical.

You have been given access to specific documents. Answer ONLY from these documents.
If the answer is not in the documents, say: "This knowledge was not transmitted to me. 
Feed NEXUS more context."

Context from documents:
{context}

Conversation history:
{chat_history}

Question from the present: {question}

NEXUS responds:"""
from dotenv import load_dotenv
load_dotenv()

class NexusRAG:
    def __init__(self):
        self.groq_api_key = os.getenv("GROQ_API_KEY", "")
        self.vectorstore   = None
        self.doc_count     = 0
        self.chat_history  = []

        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200,
            separators=["\n\n", "\n", ".", " "]
        )
        self.embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2",
            model_kwargs={"device": "cpu"}
        )
        self._init_llm()

    def _init_llm(self):
        if not self.groq_api_key or self.groq_api_key == "your_groq_api_key_here":
            print("⚠️  GROQ_API_KEY not set. Paste your key into rag.py")
            self.llm = None
            return
        self.llm = ChatGroq(
            api_key=self.groq_api_key,
            model_name="llama-3.3-70b-versatile",
            temperature=0.3,
            streaming=True,
        )
        print("✅ NEXUS LLM initialized — Groq Llama3-70B ready")

    def _add_documents(self, docs: list, source: str) -> Dict:
        chunks = self.splitter.split_documents(docs)
        if self.vectorstore is None:
            self.vectorstore = FAISS.from_documents(chunks, self.embeddings)
        else:
            self.vectorstore.add_documents(chunks)
        self.doc_count += 1
        print(f"✅ Ingested: {source} — {len(chunks)} chunks")
        return {"source": source, "chunks": len(chunks)}

    # ── Ingestion ──────────────────────────────

    def ingest_pdf(self, content: bytes, filename: str) -> Dict:
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
            tmp.write(content)
            tmp_path = tmp.name
        loader = PyPDFLoader(tmp_path)
        docs   = loader.load()
        os.unlink(tmp_path)
        return self._add_documents(docs, filename)

    def ingest_text(self, text: str, source_name: str = "text_input") -> Dict:
        docs = [Document(page_content=text, metadata={"source": source_name})]
        return self._add_documents(docs, source_name)

    async def ingest_url(self, url: str) -> Dict:
        loader = WebBaseLoader(url)
        docs   = loader.load()
        return self._add_documents(docs, url)

    # ── Chat history helpers ───────────────────

    def _get_history_string(self) -> str:
        recent = self.chat_history[-6:]
        lines  = []
        for entry in recent:
            lines.append(f"Human: {entry['human']}")
            lines.append(f"NEXUS: {entry['nexus']}")
        return "\n".join(lines)

    def _save_to_history(self, question: str, answer: str):
        self.chat_history.append({"human": question, "nexus": answer})
        if len(self.chat_history) > 20:
            self.chat_history = self.chat_history[-20:]

    # ── Query ──────────────────────────────────

    async def query(self, question: str) -> Dict[str, Any]:
        if not self.vectorstore or not self.llm:
            return {
                "response": "NEXUS offline. Check API key and feed documents.",
                "sources": []
            }

        retriever     = self.vectorstore.as_retriever(
            search_type="mmr",
            search_kwargs={"k": 4, "fetch_k": 8}
        )
        relevant_docs = retriever.invoke(question)
        context       = "\n\n".join([doc.page_content for doc in relevant_docs])
        sources       = list({
            doc.metadata.get("source", "unknown") for doc in relevant_docs
        })

        prompt_text = NEXUS_SYSTEM_PROMPT.format(
            context=context,
            chat_history=self._get_history_string(),
            question=question
        )

        response = await self.llm.ainvoke(prompt_text)
        answer   = response.content
        self._save_to_history(question, answer)
        return {"response": answer, "sources": sources}

    async def stream_response(self, question: str) -> AsyncGenerator[str, None]:
        if not self.vectorstore or not self.llm:
            yield f"data: {json.dumps({'text': 'NEXUS offline. Check API key and feed documents.'})}\n\n"
            yield f"data: {json.dumps({'done': True})}\n\n"
            return

        try:
            retriever     = self.vectorstore.as_retriever(
                search_type="mmr",
                search_kwargs={"k": 4, "fetch_k": 8}
            )
            relevant_docs = retriever.invoke(question)
            context       = "\n\n".join([doc.page_content for doc in relevant_docs])
            sources       = list({
                doc.metadata.get("source", "unknown") for doc in relevant_docs
            })

            prompt_text = NEXUS_SYSTEM_PROMPT.format(
                context=context,
                chat_history=self._get_history_string(),
                question=question
            )

            full_response = ""
            async for chunk in self.llm.astream(prompt_text):
                token = chunk.content
                if token:
                    full_response += token
                    yield f"data: {json.dumps({'text': token})}\n\n"

            self._save_to_history(question, full_response)
            yield f"data: {json.dumps({'sources': sources, 'done': True})}\n\n"

        except Exception as e:
            print(f"❌ NEXUS stream error: {e}")
            yield f"data: {json.dumps({'text': f'NEXUS encountered an error: {str(e)}'})}\n\n"
            yield f"data: {json.dumps({'done': True})}\n\n"

    # ── Utility ────────────────────────────────

    def get_doc_count(self) -> int:
        return self.doc_count

    def reset(self):
        self.vectorstore  = None
        self.doc_count    = 0
        self.chat_history = []
        print("🔄 NEXUS memory wiped")