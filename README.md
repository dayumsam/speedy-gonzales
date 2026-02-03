# QuickRead

A Chrome extension that transforms any article into a Rapid Serial Visual Presentation (RSVP) reader for faster reading and improved comprehension.

![QuickRead Demo](docs/all_text.gif)

## Features

- **Text Selection Support** — Select specific text to read, or let it extract the full article
- **Timeline Scrubber** — Click or drag to navigate through text
- **Zen Mode** — Controls fade away during reading for distraction-free focus
- **Adaptive Text Extraction** — Automatically detects and extracts readable content
- **Customizable Speed** — 100 to 1000 WPM
- **Focus Letter Highlighting** — Optimal fixation point highlighting
- **Keyboard Shortcuts** — Full keyboard control

## Installation

### From Source (Developer Mode)

1. Clone this repository
   ```bash
   git clone https://github.com/yourusername/quickread.git
   ```
2. Open Chrome and go to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top-right)
4. Click **Load unpacked** and select the cloned folder

### From Chrome Web Store

Coming soon.

## Usage

### Starting the Reader

| Method | Action |
|--------|--------|
| Keyboard | Press `Alt+Shift+S` on any webpage |
| Popup | Click extension icon → Start Reading |

### Reading Selected Text

1. Highlight text on a page
2. Press `Alt+Shift+S` or click Start Reading
3. Only the selected text will be displayed

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Alt+Shift+S` | Start reader |
| `Space` | Play / Pause |
| `R` | Restart |
| `Esc` | Close |
| `←` / `→` | Skip 10 words |

## Project Structure

```
quickread/
├── manifest.json       # Extension configuration (MV3)
├── background.js       # Service worker - script injection & shortcuts
├── content.js          # RSVP reader logic & text extraction
├── content.css         # Reader overlay styles
├── popup.html          # Settings popup
├── popup.js            # Popup logic
├── popup.css           # Popup styles
├── icon*.png           # Extension icons
└── docs/               # Screenshots and demos
```

## How It Works

### Text Extraction

1. **Find content** — Searches for `article`, `main`, `[role="main"]`, or common content classes
2. **Remove noise** — Strips scripts, nav, ads, sidebars, forms
3. **TreeWalker extraction** — Walks DOM nodes to properly separate words across elements
4. **Split into words** — Normalizes whitespace and creates word array

### Focus Letter (ORP)

The Optimal Recognition Point is positioned at ~20-30% into each word:

| Word Length | Focus Position | Example |
|-------------|----------------|---------|
| 1 letter | 1st | **I** |
| 2-5 letters | 2nd | h**e**llo |
| 6-9 letters | 3rd | re**a**ding |
| 10-13 letters | 4th | inf**o**rmation |
| 14+ letters | 5th | inte**r**nationally |

### Speed Calculation

```javascript
interval = 60000 / wpm  // milliseconds per word
```

## Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Ideas for Contribution

- [ ] Multi-language support
- [ ] Reading statistics and history
- [ ] Custom color themes
- [ ] Word pause on punctuation
- [ ] Export reading progress
- [ ] PDF file support
- [ ] Firefox port

## Browser Compatibility

| Browser | Status |
|---------|--------|
| Chrome | ✅ Tested |
| Edge | ✅ Should work |
| Brave | ✅ Should work |
| Firefox | ❌ Not yet |

## License

MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

Built with vanilla JavaScript, CSS3, and Chrome Extension Manifest V3. Zero dependencies.
