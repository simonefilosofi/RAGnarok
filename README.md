# RAGnarok

> A production-ready, zero-cost, multi-user RAG (Retrieval-Augmented Generation) app.

**Stack:** React 18 + Vite + Tailwind · FastAPI + sentence-transformers · Supabase (pgvector + Auth + RLS) · Groq API (BYOK)

**Deploy targets:** GitHub Pages (frontend) · HuggingFace Spaces Docker (backend)

---

## Features

- Upload PDFs — chunked, embedded, and stored per user
- Chat with your documents — streamed answers with source citations
- Persistent chat history — sessions saved to Supabase, auto-titled from first message
- Chat session sidebar — browse and resume past conversations
- Full user isolation — RLS ensures no cross-user data leakage
- BYOK Groq key — kept in memory only, never persisted or sent to storage

---

## Architecture

```
Browser → GitHub Pages (React SPA)
            │  Authorization: Bearer <supabase_jwt>
            │  X-LLM-Key: gsk_...   (never persisted)
            ▼
HuggingFace Spaces (FastAPI, port 7860)
  ├─ Verify JWT (SUPABASE_JWT_SECRET)
  ├─ Embed query (all-MiniLM-L6-v2, 384-dim)
  ├─ RPC match_documents → Supabase (pgvector HNSW, RLS active)
  └─ Stream Groq llama-3.1-8b-instant → SSE → Browser

Supabase
  ├─ Auth (email/password, JWT)
  ├─ documents, document_chunks, chat_sessions, chat_messages
  ├─ pgvector HNSW index (m=16, ef_construction=64)
  └─ RLS: auth.uid() = user_id on every table
```

---

## Setup Guide

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the migrations in order:
   - `supabase/migrations/001_schema.sql`
   - `supabase/migrations/002_rls.sql`
3. Collect these values from **Settings → API**:
   - `Project URL` → `SUPABASE_URL`
   - `anon public` key → `SUPABASE_ANON_KEY`
   - `JWT Secret` (Settings → API → JWT Settings) → `SUPABASE_JWT_SECRET`

### 2. Backend — HuggingFace Spaces

1. Create a new Space: **Docker** runtime, **CPU** hardware (free tier)
2. Push the `server/` directory contents to the Space repository
3. Set the following **Repository Secrets** (Settings → Repository secrets):

   | Secret | Value |
   |---|---|
   | `SUPABASE_URL` | Your Supabase project URL |
   | `SUPABASE_ANON_KEY` | Your Supabase anon key |
   | `SUPABASE_JWT_SECRET` | Your Supabase JWT secret |
   | `ALLOWED_ORIGINS` | `https://yourusername.github.io` |

4. The Space will build and expose the API at `https://yourusername-ragnarok.hf.space`
5. Verify: `GET https://yourusername-ragnarok.hf.space/health` → `{"status":"ok"}`

### 3. Frontend — GitHub Pages

1. Fork/clone this repo
2. Go to **Settings → Secrets and variables → Actions** and add:

   | Secret | Value |
   |---|---|
   | `VITE_SUPABASE_URL` | Your Supabase project URL |
   | `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |
   | `VITE_API_BASE_URL` | Your HuggingFace Space URL |

3. Go to **Settings → Pages** → Source: **GitHub Actions**
4. Push to `main` → GitHub Actions builds and deploys automatically
5. App is live at `https://yourusername.github.io/RAG/`

### 4. Groq API Key

Get a free key at [console.groq.com](https://console.groq.com). Paste it in the app's sidebar after signing in. **It lives in memory only and is never sent to a server for storage.**

---

## Local Development

### Backend

```bash
cd server
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in your values
uvicorn app.main:app --reload --port 8000
# → http://localhost:8000/health
```

### Frontend

```bash
cd client
npm install
cp .env.example .env.local   # fill in your values (point API to localhost:8000)
npm run dev
# → http://localhost:5173/RAG/
```

---

## Security Notes

- **RLS everywhere**: `auth.uid() = user_id` on all four tables — users are completely isolated
- `match_documents()` uses `SECURITY INVOKER` so RLS applies inside the function
- Backend verifies every JWT with `SUPABASE_JWT_SECRET` before any DB access
- Frontend uses the **anon key only**; service role key never leaves backend `.env`
- Groq key: Zustand **in-memory store** (no `persist` middleware), validated by regex `^gsk_[a-zA-Z0-9]{50,}$`, used ephemerally, never stored

---

## Verification Checklist

- [ ] SQL migrations applied — tables + `match_documents` function exist in Supabase
- [ ] `GET /health` returns `{"status":"ok"}`
- [ ] Sign up a user, set Groq key, upload a PDF, ask a question → streamed answer with source citations
- [ ] Chat session appears in sidebar, titled from first message
- [ ] Sign up a second user — they see zero documents and zero chat history (RLS isolation confirmed)
- [ ] Push to `main` → GitHub Actions deploys to gh-pages

---

## License

MIT
