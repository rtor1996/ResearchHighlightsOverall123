# NIT Trichy Research Highlights Dashboard

## Run locally on Windows

Do **not** double-click `index.html` directly. The dashboard loads its JSON data files using browser fetch requests, which may be blocked when opened with the `file://` protocol.

1. Extract the complete ZIP folder.
2. Double-click `start_local.bat`.
3. Keep the black command window open.
4. Open **http://localhost:8000** in Chrome or Edge.
5. When finished, close the command window.

Python must be installed on the computer for `start_local.bat` to work. If Python is already installed but the launcher does not find it, open Command Prompt in this folder and run:

```bat
py -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

## Publish on GitHub Pages

Upload the complete contents of this folder to the root of the GitHub repository. Keep `index.html`, `start_local.bat`, the `assets` folder, and the `data` folder together. GitHub Pages can serve the dashboard over HTTPS without running the local server.

## Included sections

- Overall Research Highlights (1996–2026)
- Current Research Output (2025–2026)
- OpenAlex Profile

The SciVal citation-by-year data and OpenAlex works-by-year data are kept separate because they represent different metrics and sources.
