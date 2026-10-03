# Vitality Referral UI

A mobile-first, mock-only referral handoff preview built with Next.js, TypeScript, and Tailwind CSS.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000/](http://localhost:3000/) or [http://localhost:3000/vitality-ui](http://localhost:3000/vitality-ui).

## Preview views

Use the role switcher to explore three fictional workflows:

- **BHW:** browse patients and follow-up cases, capture screening details, and submit a demo referral.
- **Hospital:** review referrals, request information, confirm demo appointments, record attendance, and return demo outcomes.
- **Patient:** view one selected case, confirmed appointment details, referral progress, and returned outcome.

## Scope and environment

All patients, staff, locations, appointments, documents, contacts, and clinical outcomes are fictional demo data. State is stored only in browser memory. There is no authentication, backend, API, database, file upload, AWS/Supabase integration, or real clinical workflow.

Environment values are optional placeholders for future integration only. If configuration is added later, copy the placeholder file and provide values locally:

```bash
cp .env.example .env.local
```

Never place real credentials in example files, source code, commits, or pull requests. Supplied secrets must remain local and must never be committed.

See [`app/vitality-ui/README.md`](app/vitality-ui/README.md) for component contracts and integration boundaries.
