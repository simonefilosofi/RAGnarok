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
  ├─ Verify JWT via JWKS (ES256/RS256/HS256, survives key rotations)
  ├─ Embed query (BAAI/bge-small-en-v1.5, 384-dim)
  ├─ Cross-encoder reranker (ms-marco-MiniLM-L-6-v2)
  ├─ RPC match_documents → Supabase (pgvector HNSW, RLS active)
  └─ Stream Groq llama-3.1-8b-instant → SSE → Browser

Supabase
  ├─ Auth (email/password, JWT — currently ECC P-256 / ES256)
  ├─ documents, document_chunks, chat_sessions, chat_messages
  ├─ pgvector HNSW index (m=16, ef_construction=64)
  └─ RLS: auth.uid() = user_id on every table
```

---

## CI/CD

| Workflow | Trigger | Target |
|---|---|---|
| `deploy.yml` | Push to `main` | GitHub Pages (frontend) |
| `deploy-backend.yml` | Push to `main` with changes in `server/` | HuggingFace Spaces (backend) |

Both workflows run automatically. You can also trigger `deploy-backend.yml` manually from **GitHub → Actions → Deploy Backend to HuggingFace Spaces → Run workflow**.

> **Note:** The backend workflow uses `git subtree split` to push only the `server/` directory to the HF Space repository. It requires a `HF_TOKEN` GitHub Actions secret (HuggingFace write token for the Space).

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

> **JWT verification** uses the JWKS endpoint (`{SUPABASE_URL}/auth/v1/.well-known/jwks.json`) and supports any algorithm Supabase uses (ES256, RS256, HS256). No JWT secret needed in the backend — it handles key rotations automatically.

### 2. Backend — HuggingFace Spaces

1. Create a new Space: **Docker** runtime, **CPU** hardware (free tier)
2. Set the following **Repository Secrets** (Settings → Repository secrets):

   | Secret | Value |
   |---|---|
   | `SUPABASE_URL` | Your Supabase project URL |
   | `SUPABASE_ANON_KEY` | Your Supabase anon key |
   | `SUPABASE_JWT_SECRET` | Your Supabase JWT secret (legacy, kept for config) |
   | `ALLOWED_ORIGINS` | `https://yourusername.github.io` |

3. The Space will build and expose the API at `https://yourusername-spacename.hf.space`
4. Verify: `GET https://yourusername-spacename.hf.space/health` → `{"status":"ok"}`

### 3. Frontend — GitHub Pages

1. Fork/clone this repo
2. Go to **Settings → Secrets and variables → Actions** and add:

   | Secret | Value |
   |---|---|
   | `VITE_SUPABASE_URL` | Your Supabase project URL |
   | `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |
   | `VITE_API_BASE_URL` | Your HuggingFace Space URL |
   | `HF_TOKEN` | HuggingFace write token for your Space |

3. Go to **Settings → Pages** → Source: **GitHub Actions**
4. Push to `main` → both frontend and backend deploy automatically
5. App is live at `https://yourusername.github.io/RAGnarok/`

> **HuggingFace token**: generate it at [hf.co/settings/tokens](https://huggingface.co/settings/tokens) → New token → Fine-grained → select your Space → Write permission.

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
# → http://localhost:5173/RAGnarok/
```

---

## Security Notes

- **RLS everywhere**: `auth.uid() = user_id` on all four tables — users are completely isolated
- `match_documents()` uses `SECURITY INVOKER` so RLS applies inside the function
- Backend verifies every JWT via **JWKS** (`PyJWT[crypto]`), supporting ES256/RS256/HS256 — survives Supabase key rotations without any code changes
- Frontend uses the **anon key only**; service role key never leaves backend `.env`
- Groq key: Zustand **in-memory store** (no `persist` middleware), validated by regex `^gsk_[a-zA-Z0-9]{50,}$`, used ephemerally, never stored

---

## Verification Checklist

- [ ] SQL migrations applied — tables + `match_documents` function exist in Supabase
- [ ] `GET /health` returns `{"status":"ok"}`
- [ ] Sign up a user, set Groq key, upload a PDF, ask a question → streamed answer with source citations
- [ ] Chat session appears in sidebar, titled from first message
- [ ] Sign up a second user — they see zero documents and zero chat history (RLS isolation confirmed)
- [ ] Push to `main` with a `server/` change → GitHub Actions deploys backend to HF Spaces automatically

---

## License

MIT
