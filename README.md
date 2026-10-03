# Vitality minimum referral demo

BHW screening and original documents → hospital acceptance and demo appointment → reviewed SMS instructions → assessment outcome returned to the BHW.

The interface has two staff work areas only: **BHW** and **Hospital team**. There is no patient-facing portal.

Run `npm run dev -- --hostname 127.0.0.1 --port 3000`.

## Setup

Run `supabase/setup.sql` in Supabase SQL Editor. Set server-only variables from `.env.example` in `.env.local` and restart Next.js. SUPABASE_URL and SUPABASE_SECRET_KEY (or legacy SUPABASE_SERVICE_ROLE_KEY) are required. The server seeds five fictional cases on first database read. Documents use a private Storage bucket. Case saves use version checks and a database unique appointment index. Earlier browser-local records remain untouched but are not imported.

PhilSMS uses PHILSMS_API_TOKEN, optional PHILSMS_SENDER_ID, consented recipients in SMS_ALLOWED_NUMBERS, and LOCAL_DEMO_SMS_ENABLED=true. Review the exact message and confirm recipient consent before sending. Provider acceptance does not confirm delivery or patient receipt. Saved send records suppress duplicates and uncertain sends must be checked before retrying.

Bedrock uses AWS_BEDROCK_REGION or AWS_REGION and AWS_BEDROCK_MODEL_ID, with LOCAL_DEMO_AI_ENABLED=true. Standard SDK server credential chain supports local profiles and environment credentials. Never expose credentials using NEXT_PUBLIC_. AI drafts summaries and approved-plan explanations, with clinician review. It does not select diagnosis, treatment or appointments.

## Limits

Localhost-only fictional demo; staff roles are simulated. No real authentication, hospital partner/scheduler, SMS replies, confirmed delivery receipts, real clinical care, or document extraction. The map shows one illustrative barangay area and never displays patient homes. Do not deploy or enter real patient data without authentication and authorization.

## Checks

Lint, TypeScript and production build passed for the earlier baseline. The latest Santin0 sync adds PhilSMS and staff-flow tests; rerun the full checks after installing dependencies. Hosted Supabase, private Storage, live PhilSMS delivery and live Bedrock model output remain unverified until local setup. No SMS or model invocation was sent during repository migration.
