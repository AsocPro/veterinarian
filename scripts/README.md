# Screenshot Script

This script uses Playwright to automatically generate screenshots for the README.

## Quick Start (Recommended)

Just run one command and everything is handled automatically:

```bash
./scripts/generate-screenshots.sh
```

Or from the scripts directory:

```bash
cd scripts
npm run screenshots
```

**Prerequisites**: Docker or Podman must be installed. The script auto-detects which one you have.

This will:
- ✅ Auto-detect Docker or Podman
- ✅ Pull Playwright container image if needed
- ✅ Start a local server automatically
- ✅ Run Playwright in container (no host dependencies!)
- ✅ Take all screenshots
- ✅ Stop the server and clean up containers when done

**Why containers?** Running Playwright in a container means you don't need to install browser dependencies on your host system. Everything runs in an isolated environment. Works with both Docker and Podman!

## Manual Method (Without Containers)

If you prefer to run Playwright on your host system instead of using containers:

1. Install dependencies including Playwright browsers:
   ```bash
   cd scripts
   npm install
   npx playwright install chromium --with-deps
   ```

2. Start the local server from project root (in another terminal):
   ```bash
   cd /path/to/veterinarian
   python3 -m http.server 8000
   ```

3. Run the screenshot script directly:
   ```bash
   cd scripts
   npm run screenshots:js
   ```

Note: This requires installing system dependencies for Chromium, which varies by OS.

## What it generates

The script creates the following media files in the `screenshots/` directory:

1. **main-interface.png** - Full app view in light mode with sample snippets
2. **variables-section.png** - Close-up of a snippet with variables section expanded
3. **test-dialog.png** - The test dialog with variable inputs filled in
4. **dark-mode.png** - Full app view in dark mode
5. **variable-editing-demo.gif** - Animated demo of editing variables and watching command update in real-time

### Requirements for GIF generation

The animated GIF requires **ffmpeg** to be installed:
- **macOS**: `brew install ffmpeg`
- **Ubuntu/Debian**: `sudo apt-get install ffmpeg`
- **Fedora**: `sudo dnf install ffmpeg`

If ffmpeg is not available, the script will save the video file and provide manual conversion instructions.

## Customizing

### Change test data

Edit the `testSnippetData` object at the top of `take-screenshots.js` to change what snippets appear in the screenshots.

### Change viewport size

Modify the viewport dimensions in the script:
```javascript
viewport: { width: 1600, height: 900 }
```

### Add more screenshots

Add additional screenshot steps in the `takeScreenshots()` function. See the existing examples for patterns.

## How the GIF is created

The script automatically:
1. Records video of variable editing actions using Playwright
2. Types in variable fields slowly to show real-time command updates
3. Selects from dropdown lists
4. Converts the video to GIF using ffmpeg with optimized palette

The demo shows:
- Focused view of a single snippet (1000x1000 viewport)
- Using the "find" command snippet with path and filename variables
- Typing "/home/user/projects" in the `path` field (250ms per character)
- Typing "*.js" in the `filename` field (250ms per character)
- Command updating in real-time as you type
- Pauses between actions to clearly show each change
- 15 FPS for smooth animation

## Scripts Overview

- **`generate-screenshots.sh`** - Bash wrapper that handles server lifecycle automatically
- **`take-screenshots.js`** - Core Playwright script that captures the screenshots

## Troubleshooting

**"Neither Docker nor Podman is installed" error**:
- Install Docker: https://docs.docker.com/get-docker/
- OR install Podman: https://podman.io/getting-started/installation
- The script will use whichever one it finds

**"Docker daemon is not running"**:
- Start Docker Desktop (on macOS/Windows)
- Start Docker service: `sudo systemctl start docker` (on Linux)

**Podman-specific notes**:
- Podman runs rootless by default (no daemon needed)
- On Linux with SELinux, the script automatically adds `:z` labels to volumes
- Uses `host.containers.internal` instead of `host.docker.internal`

**"Connection refused" error in container**:
- Make sure the server is binding to 0.0.0.0, not just localhost
- On Linux, the script uses `--network host` for both Docker and Podman
- On macOS/Windows with Docker, it uses `host.docker.internal`
- On macOS/Windows with Podman, it uses `host.containers.internal`

**"Timeout" errors**:
- Server might be slow to start - increase wait time in script
- Check that selectors match your actual HTML/Shadow DOM structure
- Increase timeout values in `take-screenshots.js`

**Blank screenshots**:
- The app might not be loading test data correctly
- Check server is accessible from container by testing the URL manually
- Run with `headless: false` in `take-screenshots.js` for debugging

**"Port already in use"**:
- Kill existing server: `lsof -ti:8000 | xargs kill -9`
- Or change the PORT in `generate-screenshots.sh`

**"Permission denied" on bash script**:
- Make it executable: `chmod +x scripts/generate-screenshots.sh`

**Container image pull is slow**:
- The first run downloads ~1GB image, subsequent runs use cached image
- Pre-pull with Docker: `docker pull mcr.microsoft.com/playwright:v1.40.0-jammy`
- Pre-pull with Podman: `podman pull mcr.microsoft.com/playwright:v1.40.0-jammy`

**Screenshots have wrong permissions**:
- Docker may create files as root
- Podman (rootless) creates files with your user permissions automatically
- Fix Docker permissions: `sudo chown -R $USER:$USER screenshots/`
