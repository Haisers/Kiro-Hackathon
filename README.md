# Vitality referral UI

A compact, mobile-first referral handoff prototype for barangay health workers (BHWs) and hospital teams. The main page uses fictional in-memory data, so it opens without Supabase, AWS, or PhilSMS.

There are two staff work areas only:

- **BHW:** patients, follow-up, screening capture, document names, and a Metro Manila workload map.
- **Hospital team:** referral review, information requests, appointment confirmation, attendance, outcomes, and next steps.

There is no patient-facing portal.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

No `.env.local` is required for this mock UI. The existing server integration files remain in the repository for future work but are not used by the main preview.

## Metro Manila map prototype

The BHW Patients screen starts with all Metro Manila city boundaries. Select a city to load its barangays, then select a barangay to filter the patient list. The five fictional patients are assigned to Bangkal and Poblacion in Makati for demonstrating workload filters.

The map never shows patient homes or disease prevalence. Boundary data is stored locally so only OpenStreetMap background tiles require internet access.

Low-resolution boundary files come from [faeldon/philippines-json-maps](https://github.com/faeldon/philippines-json-maps) under the [MIT License](https://github.com/faeldon/philippines-json-maps/blob/master/LICENSE), using 2023 PSGC-based administrative data. See [`public/maps/ATTRIBUTION.md`](public/maps/ATTRIBUTION.md). City of Manila barangay shapes are unavailable in the selected source dataset and are not invented.

## Important limits

- All patients, referrals, staff, appointments, contacts, and outcomes are fictional demo data.
- Selected document contents are not uploaded or stored.
- Appointment and clinical actions are simulated.
- Boundaries are illustrative and must not be treated as current legal or surveying boundaries.
- Do not enter real patient information or deploy this prototype as a clinical system.

See [`app/vitality-ui/README.md`](app/vitality-ui/README.md) for component contracts and integration notes.
