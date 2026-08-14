# Visa Sponsored Jobs

Live UK **Skilled Worker visa** jobs, matched to the official Home Office register of licensed sponsors, plus daily UK visa news. Developed by [Sagar Gondaliya](https://www.linkedin.com/in/sagar-gondaliya).

## Run

```bash
npm install
npm run sync
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

`npm run sync` downloads the latest GOV.UK sponsor CSV, public job feeds, and UK visa news. While the app is running locally, jobs refresh about every two hours and news at least daily.

## Publish

Set `NEXT_PUBLIC_SITE_URL` to your live domain (for example `https://your-domain.com`) so sitemap, robots and Open Graph tags are correct. Optional: `NEXT_PUBLIC_CONTACT_EMAIL`.

### Keeping production data fresh

Vercel’s filesystem is **read-only**, so `/api/sync` cannot update `data/` there (that caused the “Automatic update failed” banner). Production listings come from the JSON files committed in `data/`.

- **GitHub Actions** (`.github/workflows/sync-data.yml`) runs `npm run sync` daily and commits refreshed data; Vercel then redeploys.
- Or run `npm run sync` locally and push the updated `data/` files.
- Optional Adzuna/Reed keys can be added as repository secrets (`ADZUNA_APP_ID`, `ADZUNA_APP_KEY`, `REED_API_KEY`) for the workflow.

## Optional extra job sources

Copy `.env.example` to `.env.local` and add free keys from [Adzuna](https://developer.adzuna.com) and [Reed](https://www.reed.co.uk/developers) for wider coverage. The site works without them.
