# C2X Voicebot CRM 🎙️

### *AI-Driven Telephony, Inbound/Outbound Campaign Automation & RAG Knowledge Engine*

## 📖 Table of Contents

- [Executive Summary](#executive-summary)
- [Key Features](#key-features)
- [Tech Stack & Architecture](#tech-stack--architecture)
- [Repository Structure](#repository-structure)
- [Environment Variables Setup](#environment-variables-setup)
- [Local Development Workflow](#local-development-workflow)
- [API Endpoint Directory](#api-endpoint-directory)
- [Production Deployment](#production-deployment-vercel)
- [Security & Compliance](#security--compliance)

---

## 📌 Executive Summary

**C2X Voicebot CRM** is an end-to-end, multi-tenant AI telephony and customer relationship management platform. It pairs a **Next.js 16** frontend with a dedicated **Node.js/Express** backend, **Vapi** voice orchestration, **Google Gemini** (via LangChain), and a **Pinecone** vector store to power automated inbound and outbound voice-agent workflows grounded in a real-time Knowledge Base (RAG).

It features multi-tier access control (Superadmin, Tenant Admin, and Agent views), dynamic lead management, automated call campaign dispatching, live call transfers, and deep analytics.

---

## 🚀 Key Features

### 🎙️ 1. AI Telephony & Real-Time Voice Agents (Vapi)

- **Outbound Campaign Automation** — Trigger automated voice campaigns to prospect lists.
- **Inbound Call Handling** — Real-time voice agent responses grounded in dynamic knowledge bases.
- **Live Call Transfers & Function Calling** — Dynamically transfer calls to human agents or query external APIs (e.g., college search, lead status lookups) mid-call via Vapi function calls.
- **Webhook Processing** — Real-time, signature-verified ingestion of call transcripts, sentiment, call durations, and post-call summaries.

### 🧠 2. Dynamic RAG Knowledge Base (Pinecone + Gemini)

- **Document Ingestion** — Upload PDF knowledge bases via the Admin Portal (`pdf-parse`).
- **Semantic Embeddings** — Chunking via `@langchain/textsplitters`, vectorized with Google Gemini embeddings (`@langchain/google-genai`).
- **Vector Search** — Real-time retrieval via Pinecone to ground voicebot responses in verified company documentation.

### 🏢 3. Multi-Tenant Architecture & RBAC

- **Superadmin Portal (`/superadmin`)** — System-wide tenant provisioning, API key management, usage monitoring, billing administration.
- **Tenant Admin Portal (`/admin`)** — Campaign creation, lead uploading, knowledge base management, campaign analytics.
- **Agent Portal (`/agent`)** — Agent inbox, post-call reviews, call logs, manual lead follow-ups.

### 🔐 4. Enterprise Security & Authentication

- Multi-tenant authentication powered by **Clerk**.
- Route protection on the Next.js side (`proxy.ts`) plus Clerk-secured Express routes on the backend.
- Environment-isolated secrets — no credentials committed to source.

---

## 🛠️ Tech Stack & Architecture

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS, Shadcn/Radix UI |
| **Backend Service** | Node.js + Express 5 (entry point: `sarvam-server.js`) |
| **Authentication** | Clerk — `@clerk/nextjs` (frontend), `@clerk/express` + `@clerk/clerk-sdk-node` (backend) |
| **Voice & Telephony** | Vapi — REST API + signed webhooks (`svix`) |
| **Primary Database** | MongoDB via Mongoose |
| **Vector Database** | Pinecone (`@pinecone-database/pinecone`) |
| **LLM & Embeddings** | Google Gemini via LangChain (`@langchain/google-genai`); LangChain/OpenAI support also present (`@langchain/openai`) |
| **Data Ingestion** | `pdf-parse` (knowledge base PDFs), `csv-parse` (lead uploads) |
| **Deployment** | Vercel |

> This repo contains two services: the **Express backend** at the repo root (telephony, webhooks, RAG ingestion, lead/campaign logic) and the **Next.js frontend** in `frontend-crm/` (dashboards, portals, its own `/api` routes). Both need to be running for the full system to work locally.

---

## 📂 Repository Structure

```text
ai-voicebot-crm/
├── controllers/            # Backend controller logic (Express)
├── middleware/              # Custom Express middleware
├── models/                  # Mongoose schemas (Leads, Campaigns, Tenants)
├── routes/                  # Express route definitions
├── sarvam-server.js         # Backend entry point ("npm start")
├── campaign.js               # Campaign dispatch logic
├── ingest-pdf.js              # Knowledge base PDF → Pinecone ingestion
├── lead-manager.js            # Lead management utilities
├── seed.js                     # Database seed script
├── package.json                 # Backend dependencies
└── frontend-crm/                  # Next.js 16 application root
    ├── app/                       # App Router routes & page UI
    │   ├── (auth)/                # Clerk sign-in / sign-up pages
    │   ├── admin/                 # Tenant Admin dashboard, analytics, KB upload
    │   ├── agent/                 # Agent inbox & post-call log views
    │   ├── superadmin/            # System tenant & billing management
    │   └── api/                   # Serverless API endpoints
    │       ├── admin/             # Knowledge upload & tenant verify routes
    │       ├── leads/             # Lead management endpoints
    │       └── vapi/              # Webhooks, synthesis, transfers, college search
    ├── proxy.ts                   # Next.js 16 Clerk session proxy
    ├── package.json               # Frontend dependencies
    └── next.config.ts             # Next.js configuration
```

> The repo root also currently has a few dev/test artifacts (`test-*.js`, `sample-leads.csv`, `college.pdf`, sample `.wav` recordings) not shown above — worth moving into `/scripts` and `/tests` folders since the repo is public.

---

## ⚙️ Environment Variables Setup

Two separate `.env` files are needed — one per service.

**Backend — `.env` in the repo root:**

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/c2x_crm
PINECONE_API_KEY=pcsk_...
PINECONE_INDEX=voicebot-index
GEMINI_API_KEY=AIzaSy...
VAPI_API_KEY=vapi_...
VAPI_PHONE_NUMBER_ID=...
CLERK_SECRET_KEY=sk_live_...
```

**Frontend — `.env.local` in `frontend-crm/`:**

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
NEXT_PUBLIC_APP_URL=https://ai-voicebot-crm.vercel.app
```

> Never commit either `.env` file — confirm both are covered by `.gitignore` before pushing.

---

## 💻 Local Development Workflow

### Prerequisites
- Node.js v24.x or v20.x
- npm v10+
- A MongoDB instance or Atlas cluster connection

### 1. Clone the repository
```bash
git clone https://github.com/C2X-company/ai-voicebot-crm.git
cd ai-voicebot-crm
```

### 2. Start the backend
```bash
npm install
npm start
```
Runs `sarvam-server.js` — the Express service handling Vapi webhooks, campaigns, and RAG ingestion.

### 3. Start the frontend (new terminal)
```bash
cd frontend-crm
npm install
npm run dev
```

### 4. Open the app
Visit `http://localhost:3000` in your browser.

---

## 📡 API Endpoint Directory

### 🎙️ Vapi Telephony Endpoints (`/api/vapi/*`)
- `POST /api/vapi/webhook` — Ingests real-time events, call logs, transcripts, and summaries from Vapi.
- `POST /api/vapi/transfer` — Executes automated mid-call transfers to human agents.
- `POST /api/vapi/search-college` — Function-call tool used by voice agents to query program/college data mid-call.
- `POST /api/vapi/synthesize` — Voice synthesis helper endpoint.

### ⚙️ Administration & Knowledge Base (`/api/admin/*`)
- `POST /api/admin/upload-knowledge` — Parses uploaded PDFs, generates embeddings via Gemini, indexes them in Pinecone.
- `POST /api/admin/verify` — Verifies tenant domain authorization.

### 📋 Lead Engine (`/api/leads/*`)
- `GET /api/leads` — Retrieves filtered lead lists.
- `POST /api/leads` — Ingests new leads into campaigns.

---

## 🚢 Production Deployment (Vercel)

1. **Vercel Project Configuration**
   - Framework Preset: Next.js
   - Root Directory: `frontend-crm`
   - Node.js Engine: 24.x (enforced via `package.json`)

2. **Environment Variable Scope** — map all environment variables to **Production** and **Preview** in Vercel. The backend service (repo root) is deployed separately from the Vercel-hosted frontend.

3. **Deploy Trigger** — pushing to `main` kicks off the automated CI/CD pipeline on Vercel.

---

## 🔒 Security & Compliance

- Sensitive keys (database, AI, auth secrets) are restricted to server-side environments — never exposed to the client.
- Incoming Vapi webhooks are signature-verified (`svix`) before processing.
- Access control is enforced across `/admin`, `/superadmin`, and `/agent` sub-routes via Clerk authentication checks.

