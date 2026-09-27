# PRism-AI Showcase Website

This is the static product landing page for **PRism-AI**, designed for the IBM Hackathon 2026.

## 🚀 How to Preview Locally
You can simply open `index.html` directly in your browser, or start a local server:

```bash
# Using Python:
python -m http.server 3000

# Or using Node.js:
npx serve .
```
Then visit `http://localhost:3000` in your web browser.

## 📂 File Structure
- `index.html` — The main landing page with interactive hero simulator, architecture diagram, feature highlights, install guide, and CLI reference.
- `styles.css` — Modern, responsive CSS styling inspired by IBM Carbon design and high-converting developer tools.
- `main.js` — Interactive logic:
  - Hero Terminal Simulator (Toggle between "The Buggy PR", "Traditional CI", and "PRism-AI Re-verified" with live typing animation).
  - CLI Command Tabs (`prismai chat`, `check`, `watch`, `doctor`).
  - One-click copy-to-clipboard buttons with visual feedback.
- `favicon.svg` — Custom PRism-AI logo favicon.

## 🌐 Deploying to GitHub Pages (When Ready)
1. Push this folder to a GitHub repository (e.g., `PRism-AI-Website`).
2. Go to **Settings** &rarr; **Pages**.
3. Under **Build and deployment**, select **Deploy from a branch**.
4. Choose `main` branch and `/ (root)` folder.
5. Click **Save** — your site will be live on `https://<username>.github.io/<repo>/` in under a minute!
