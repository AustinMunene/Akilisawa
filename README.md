# Akilisawa

Akili Sawa is a climate-resilient, tech-enabled mental health and wellness ecosystem designed to make therapy, psychological support, and behavioral health tools affordable, accessible, and culturally relevant for Kenyans everywhere.

## Overview

Akilisawa leverages modern web technologies to bridge the gap between mental health services and communities, providing accessible, inclusive, and culturally grounded digital mental health solutions.

## Tech Stack

- React – Frontend library for building user interfaces
- TypeScript – Type-safe JavaScript for scalable development
- Tailwind CSS – Utility-first CSS framework for rapid UI styling
- Framer Motion – Animation library for smooth and interactive user experiences
- Vite – Build tool and dev server
- Resend – Transactional email, for the contact form, product feedback and Sawa AI safety escalations
- Vercel – Hosting and serverless functions for `api/`

## Getting Started

Follow the steps below to set up the project locally.

### Prerequisites

- Node.js (v18 or later recommended)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/<your-username>/Akilisawa.git

# Navigate into the project folder
cd Akilisawa

# Install dependencies
npm install

# Start the development server
npm run dev
```

The site runs on `http://localhost:5173`. The dev server also runs the `api/` handlers
locally, so the contact form and the feedback form work in development.

## Verifying your work

```bash
npm run verify
```

That is `typecheck` then `lint` then `test`, in that order, and all three must pass. It
covers `src/` **and** `api/`. See `AGENTS.md` for the full list of commands.

## Environment variables

Copy `.env.example` to `.env.local` and fill in the values. `.env.local` is gitignored
and must never be committed.

| Variable | Needed for | Notes |
|---|---|---|
| `RESEND_API_KEY` | The contact form, the feedback form, the Sawa AI safety escalation | Without it the forms answer with a configuration error rather than sending |
| `CONTACT_TO_EMAIL` | Where contact enquiries are delivered | Defaults to `smile@akilisawa.com` |
| `CONTACT_FROM_EMAIL` | The sender address for contact mail | Defaults to `smile@akilisawa.com` |
| `SAWA_ESCALATION_TO` | Where a high-severity safety signal is delivered | Defaults to the same mailbox as `CONTACT_TO_EMAIL` |
| `SAWA_ESCALATION_ENABLED` | Switches the safety escalation path on or off | Defaults to on. Set to `false` to switch it off |
| `SAWA_MODEL_PROVIDER` | The Sawa AI model provider | `nvidia` or `openai` |
| `NVIDIA_API_KEY` / `NVIDIA_BASE_URL` / `NVIDIA_MODEL` | Sawa AI, when the provider is `nvidia` | All three are required together |
| `OPENAI_API_KEY` / `OPENAI_BASE_URL` / `OPENAI_MODEL` | Sawa AI, when the provider is `openai` | All three are required together |
| `SAWA_PROVIDER_TIMEOUT_MS` | Sawa AI | Falls back to the module default |

### Before mail can be delivered

Sending from `akilisawa.com` requires that domain to be verified as a sending domain at
Resend, with the matching DKIM and SPF records in the DNS zone. Until that is done, the
forms work but nothing is delivered. The full checklist is in
[`docs/resend-domain-verification.md`](./docs/resend-domain-verification.md).

## Project layout

| Path | What it holds |
|---|---|
| `src/` | The React app: pages, components, and the Sawa AI library under `src/lib/sawa/` |
| `api/` | Vercel serverless handlers: the contact form, the feedback form, the Sawa AI chat endpoint and the safety escalation endpoint |
| `tests/` | Vitest tests, one file per area |
| `docs/adr/` | Architecture decision records |
| `docs/` | Operational documents, including the Resend domain checklist |
| `GLOSSARY.md` | The shared vocabulary of the project |
| `AGENTS.md` | How to verify work, and the conventions this repository follows |
