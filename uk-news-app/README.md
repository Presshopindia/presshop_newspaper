# UK News App (Next.js 14)

Production-ready frontend for the multi-country news platform.

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Day.js for date formatting

## Environment Variables

Copy the template:


```bash
cp .env.example .env
```

Set values in `.env`:

- `NEWS_API_BASE_URL`: backend news endpoint (example: `https://api.example.com/api/news`)
- `NEXT_PUBLIC_SITE_URL`: public frontend URL (example: `https://news.example.com`)
- `NEXT_PUBLIC_DEFAULT_COUNTRY`: default country code (`gb`, `in`, `us`, etc.)

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Pre-deploy Checks

```bash
npm run lint
npm run build
```

## Deploy (Vercel Recommended)

1. Push this app to GitHub.
2. Import repo/project in Vercel.
3. Set environment variables from `.env.example`.
4. Deploy.

Build command:

```bash
npm run build
```

Note for Vercel: keep **Output Directory empty** for Next.js projects.

## Country-aware API behavior

Frontend automatically sends country context to backend via:

- Query param: `?country=<code>`
- Header: `x-country: <code>`

Default is controlled by `NEXT_PUBLIC_DEFAULT_COUNTRY`.
