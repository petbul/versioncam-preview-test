# versioncam-preview-test

A test repository for versioncam's WP20: recording a clip against a
deployed Vercel preview, through Vercel's Deployment Protection, signed in
with a test account from secrets.

The app is a small Next.js page behind a sign-in. The clip is in
`demos/clips/`, the config in `versioncam.config.ts` (no `webServer`: CI
records the commit's own deployment), and the workflow in
`.github/workflows/versioncam.yml`.

Secrets the workflow reads: `VERCEL_AUTOMATION_BYPASS_SECRET` (Vercel's
Protection Bypass for Automation), `RECORDING_USER` and `RECORDING_PASS`
(the app's test account).

Run it locally against `next dev`:

```bash
npm ci
npm run dev
RECORDING_USER=... RECORDING_PASS=... npx versioncam check
```
