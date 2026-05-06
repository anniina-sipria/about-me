# about-me

Windows XP-vibe portfolio site built with Eleventy, hosted on GitHub Pages, managed with Decap CMS.

This project uses the open-source XP.css library for the window UI look.

## Local development

- Install: `npm install`
- Run dev server: `npm run dev`
- Build: `npm run build`

The site outputs to `_site/`.

## Content

- Pages live in `src/pages/`
- Projects live in `src/content/projects/`

## Decap CMS

The admin UI is at `/admin/`.

1. Edit `src/admin/config.yml` and set:
	- `backend.repo: YOUR_GITHUB_USERNAME/YOUR_REPO`
2. GitHub Pages cannot run the OAuth callback endpoint Decap needs.
	- Deploy a small OAuth helper service (e.g., `decap-cms-oauth`) to Cloudflare Workers/Vercel/Render.
	- Then set `base_url` + `auth_endpoint` in `src/admin/config.yml`.

## GitHub Pages

This repo includes a GitHub Actions workflow at `.github/workflows/pages.yml`.

In your GitHub repo settings:

- Settings → Pages → Build and deployment → Source: **GitHub Actions**

## Styling (XP.css)

- XP.css is installed via npm and copied into the build at `/assets/xp/`.
- The site includes `/assets/xp/XP.css` from the base layout.
- Window markup uses XP.css classes: `.window`, `.title-bar`, `.window-body`.
