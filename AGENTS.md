# Repository Guidelines

## Project Structure & Module Organization
This repository is a static GitHub Pages portfolio site. The main page lives in `index.html` and contains the HTML, embedded CSS, and external CDN references for Tailwind CSS, Font Awesome, and Google Fonts. Project images are stored in `Images/`, for example `Images/TheLastLeap.png`.

Keep new page-level assets near the existing structure:

- `index.html` for markup, styles, and small scripts.
- `Images/` for portfolio screenshots and visual assets.
- Add top-level files only for static hosting, documentation, or browser verification.

## Build, Test, and Development Commands
There is no package manager or build step. View the site directly in a browser.

- `Start-Process index.html` opens the page locally on Windows.
- `python -m http.server 8000` serves the repository at `http://localhost:8000`.
- `git status` reviews pending changes before commit.

If you add tooling later, commit the manifest and document the exact commands here.

## Coding Style & Naming Conventions
Use two-space indentation in HTML and CSS, matching `index.html`. Prefer semantic sections and descriptive class names when custom CSS is needed. Keep reusable colors in `:root` CSS variables.

Asset filenames in `Images/` use PascalCase without spaces, such as `SilentVoice.png`. Follow that pattern for new images.

## Testing Guidelines
No automated tests are currently configured. Before opening a pull request, manually verify:

- `index.html` loads without console errors.
- All images in `Images/` render correctly.
- Navigation, animations, and responsive layouts work at mobile and desktop widths.
- External CDN resources still load when served over HTTPS.

For larger changes, include screenshots or a browser-check summary.

## Commit & Pull Request Guidelines
Recent history uses short upload-style commits such as `Add files via upload`. For future work, prefer clear imperative messages, for example `Update portfolio project images` or `Refine mobile navigation`.

Pull requests should include a concise description, the reason for the change, and screenshots for visual updates. Link related issues when applicable. Keep changes focused so reviewers can inspect affected sections quickly.

## Security & Configuration Tips
Do not commit secrets, API keys, or private contact data. Because this is a public static site, assume anything in the repository is publicly accessible after deployment.
