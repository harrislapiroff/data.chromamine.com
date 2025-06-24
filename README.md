# Chromamine Data

This repository contains a basic [Observable Framework](https://observablehq.com/framework) site.

## Setup

1. Ensure you have [Node.js](https://nodejs.org/) installed.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```
4. Build the static site:
   ```bash
   npm run build
   ```

Content lives in the `content/` directory. Edit `observablehq.config.js` to customize site settings.

## Continuous Deployment

This repository includes a GitHub Actions workflow to deploy the site to [Cloudflare Pages](https://pages.cloudflare.com/). The workflow runs on every push to `main` and uses secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` for authentication.
