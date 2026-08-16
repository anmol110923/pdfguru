# PDFguru by MeraIPU

Student-first tool that turns study screenshots into clean PDFs. Processing stays in your browser.

## Live demo

https://pdfguru.meraipu.in/

The GitHub Pages URL (`https://anmol110923.github.io/pdfguru/`) redirects to the custom domain.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy

Pushes to `main` deploy automatically to GitHub Pages via [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).

For a local production preview of the static export:

```bash
npm run build
npx serve out
```
