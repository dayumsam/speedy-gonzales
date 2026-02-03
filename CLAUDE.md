# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

QuickRead is a Chrome Extension (Manifest V3) that transforms any article into a Rapid Serial Visual Presentation (RSVP) reader. It's a zero-dependency, pure vanilla JavaScript/CSS project with no build process.

## Development

No build, lint, or test commands exist. To develop:

1. Load the extension in Chrome via `chrome://extensions/` with developer mode enabled
2. Click "Load unpacked" and select this directory
3. After code changes, click the refresh icon on the extension card

## Architecture

**Three execution contexts communicate via Chrome message passing:**

1. **Background Service Worker (background.js)**
   - Listens for keyboard shortcut (`Alt+Shift+S`)
   - Listens for messages from popup
   - Programmatically injects content script and CSS using `chrome.scripting` API
   - Only injects when user explicitly activates (no broad host permissions)

2. **Popup (popup.html/js/css)** - Settings panel
   - Manages user preferences (speed, font size, focus letter toggle)
   - Persists settings to `chrome.storage.sync`
   - Sends `startFromPopup` message to background script

3. **Content Script (content.js/css)** - Injected on-demand
   - `extractArticleText()` - TreeWalker-based text extraction
   - `createRSVPOverlay()` - Creates the full-screen reading interface
   - `RSVPReader` class - Core playback controller
   - `getSelectedText()` - Detects text selection for reading specific content

**Data flow:**
```
User triggers (popup click / keyboard shortcut)
    ↓
background.js receives trigger
    ↓
Injects content.js/css via chrome.scripting (if not already injected)
    ↓
Sends startRSVP message with settings
    ↓
content.js creates RSVPReader instance
    ↓
Overlay displayed, user controls playback
```

## Key Implementation Details

- **Programmatic injection**: Uses `activeTab` + `scripting` permissions instead of `content_scripts` with `<all_urls>` to avoid broad host permissions
- **Ping detection**: Content script responds to `ping` action to prevent double injection
- **Focus letter algorithm**: Position based on word length (lines 332-339 in content.js)
- **Timeline scrubber**: Click/drag to seek, arrow keys skip 10 words
- **Zen mode**: Controls fade to opacity 0 during playback via `.is-playing` class

## Permissions

- `activeTab` - Access current tab on user action
- `scripting` - Inject content script programmatically
- `storage` - Save user preferences (WPM, font size, highlight toggle)

## Styling

- Accent color: `#ff6b35` (orange)
- Dark theme backgrounds: `#0a0a0f`, `#151520`
- Fonts: Libre Baskerville (reader), JetBrains Mono (UI)
