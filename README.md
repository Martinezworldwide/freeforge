# FreeForge Frontend

Frontend application for FreeForge forum platform.

## GitHub Pages Setup

1. Go to repository settings
2. Navigate to **Pages**
3. Under **Source**, select:
   - **Branch**: `main`
   - **Folder**: `/` (root)
4. Click **Save**
5. Your site will be available at your GitHub Pages URL

## Configuration

Update `js/config.js` with your settings before deploying.

## Local Development

Serve the files with any static file server:

```bash
# Python
python -m http.server 8000

# Node.js
npx http-server -p 8000
```

Then open `http://localhost:8000` in your browser.

## License

Proprietary - All rights reserved
