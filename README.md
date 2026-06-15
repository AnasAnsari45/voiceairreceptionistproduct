# VAI Receptionist

AI phone receptionist SaaS — inbound calls, FAQs, lead capture, appointment booking.

## Monorepo Structure

```
apps/voice-agent/   Python / Pipecat — answers phone calls (hosted on Render)
apps/web/           Next.js / TypeScript — owner dashboard & onboarding (Cloudflare Pages)
packages/shared/    Shared TypeScript types
```

## Quick Start

### Prerequisites

Copy and fill in env vars:
```
cp apps/voice-agent/.env.example apps/voice-agent/.env
cp apps/web/.env.example         apps/web/.env.local
```

### Web App

```bash
pnpm install
pnpm db:generate         # generate Prisma client
pnpm db:push             # push schema to Neon (requires DATABASE_URL)
pnpm dev:web             # start Next.js on http://localhost:3000
```

### Voice Agent (Python)

```bash
cd apps/voice-agent
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8080 --reload
```

Then expose via ngrok for Telnyx webhooks:
```bash
ngrok http 8080
# Copy the https URL into VOICE_AGENT_PUBLIC_URL in apps/voice-agent/.env
```

## Stack

| Layer | Tech |
|-------|------|
| Telephony | Telnyx (Call Control + Media Streaming) |
| STT | Deepgram (Nova-2, streaming) |
| LLM | OpenAI gpt-4o-mini |
| TTS | Cartesia |
| Voice orchestration | Pipecat (Python, self-hosted) |
| Web app | Next.js 14 + TypeScript |
| Auth | Clerk |
| Database | Neon Postgres (serverless HTTP driver) |
| ORM | Prisma |
| Calendar | Cal.com API |
| Email | Resend |
| Hosting (web) | Cloudflare Pages |
| Hosting (voice) | Render (paid, always-on) |
| Payments | Stripe |
