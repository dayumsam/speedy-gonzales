# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

RSVP Speed Reader is a Chrome Extension (Manifest V3) that transforms any article into a Rapid Serial Visual Presentation reader. It's a zero-dependency, pure vanilla JavaScript/CSS project with no build process.

## Development

No build, lint, or test commands exist. To develop:

1. Load the extension in Chrome via `chrome://extensions/` with developer mode enabled
2. Click "Load unpacked" and select this directory
3. After code changes, click the refresh icon on the extension card

## Architecture

**Two execution contexts communicate via Chrome message passing:**

1. **Popup (popup.html/js/css)** - Settings panel that opens when clicking the extension icon
   - Manages user preferences (speed, font size, focus letter toggle)
   - Persists settings to `chrome.storage.sync`
   - Sends settings to content script via `chrome.tabs.sendMessage()`

2. **Content Script (content.js/css)** - Injected into web pages
   - `extractArticleText()` - Intelligent text extraction prioritizing semantic HTML (`<article>`, `<main>`, `[role="main"]`)
   - `createRSVPOverlay()` - Creates the full-screen reading interface
   - `RSVPReader` class - Core playback controller with play/pause/restart/speed adjustment

**Data flow:** Popup collects settings → sends message with `action='startRSVP'` → content script creates RSVPReader instance → overlay displayed

## Key Implementation Details

- Focus letter position algorithm in `RSVPReader.showWord()` uses word length to determine which letter to highlight (lines 180-195 in content.js)
- Speed calculation: `60000 / wpm` milliseconds per word
- Keyboard shortcuts: Space (play/pause), R (restart), Esc (close)
- Text extraction removes 11+ element types (nav, ads, scripts, etc.) before processing

## Styling Conventions

- Accent color: `#ff6b35` (orange)
- Dark theme backgrounds: `#0a0a0f`, `#151520`
- Uses CSS custom properties for theme consistency
- Google Fonts: Crimson Pro (headers), Libre Baskerville (reader), JetBrains Mono (monospace)
