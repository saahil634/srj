# SRJ Demo

Conference-ready Next.js prototype for creating and opening governed SRJ packages.

## Environment

Create a `.env.local` file from `.env.example` and add:

`BLOB_READ_WRITE_TOKEN`

- Required for package creation, package listing, gated file previews, and persisted acceptance logs.
- Create a Vercel Blob store for the project, copy the read/write token, and add it to your local and deployed environments.
- This app is designed to work with a private Blob store so files stay inaccessible until the recipient accepts terms.

## How Persistence Works

- Package files are uploaded to Vercel Blob under `srj-demo/package-files/...`.
- Each package record is saved as JSON under `srj-demo/package-records/...`.
- Each acceptance event is written as an append-only JSON log under `srj-demo/acceptance-logs/...`.
- When a recipient accepts terms, the app also sets a short-lived access cookie so preview routes can stream the private files for that package.

## Local Development

```bash
npm install
npm run dev
```

If `BLOB_READ_WRITE_TOKEN` is missing, the UI stays navigable but package creation, package loading, and acceptance logging show clear error states instead of failing silently.
