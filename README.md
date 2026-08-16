# PDFguru by MeraIPU

Student-first tool that turns study screenshots into clean PDFs. Processing stays in your browser.

## Live demo

https://anmol110923.github.io/pdfguru/

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy

Pushes to `main` deploy automatically to GitHub Pages via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

For local production preview with the Pages base path:

```bash
GITHUB_PAGES=true npm run build
npx serve out
```
