# Speedy Gonzales

A Chrome extension that transforms any article into a Rapid Serial Visual Presentation (RSVP) reader for faster reading and improved comprehension.

## Features

- **Adaptive Text Extraction** — Automatically detects and extracts readable content from articles
- **Customizable Speed** — Adjust reading speed from 100 to 1000 WPM
- **Focus Letter Highlighting** — Optional highlighting of the optimal fixation point in each word
- **Adjustable Font Size** — Choose comfortable text size (24-72px)
- **Real-time Speed Control** — Change speed on-the-fly without stopping
- **Progress Tracking** — Visual progress bar and word counter
- **Keyboard Shortcuts** — Full keyboard control for seamless reading

## Installation

1. Download all files to a folder on your computer
2. Open Chrome and go to `chrome://extensions/`
3. Enable **Developer mode** (toggle in top-right)
4. Click **Load unpacked** and select the folder containing the extension files

## Usage

### Starting the Reader

**Option 1: Keyboard Shortcut**
- Press `Alt+Shift+R` on any webpage to instantly start reading
- Customize this shortcut at `chrome://extensions/shortcuts`

**Option 2: Extension Popup**
- Click the Speedy Gonzales extension icon in your toolbar
- Adjust settings as desired
- Click "Start Reading"

### Controls

| Key | Action |
|-----|--------|
| `Alt+Shift+R` | Start Speedy Gonzales |
| `Space` | Play / Pause |
| `R` | Restart |
| `Esc` | Close reader |

Speed can also be adjusted with the +50 / -50 buttons during reading.

### Recommended Reading Speeds

| Level | WPM | Description |
|-------|-----|-------------|
| Beginner | 200-300 | Start here to get comfortable |
| Intermediate | 300-500 | Solid reading pace |
| Advanced | 500-800 | Fast comprehension |
| Speed Reader | 800+ | Expert level |

---

## How It Works

### Text Extraction

The extension uses a multi-step process to extract clean, readable text from any webpage.

#### Step 1: Find the Main Content

Searches for article content using a priority list of CSS selectors:

```javascript
const selectors = [
  'article',           // Semantic HTML5 article tag
  '[role="main"]',     // ARIA main role
  'main',              // Semantic HTML5 main tag
  '.article-content',  // Common article class
  '.post-content',     // Blog post class
  '.entry-content',    // WordPress standard
  '.content',          // Generic content class
  'body'               // Fallback to entire body
];
```

Uses the first selector that contains more than 100 characters of text.

#### Step 2: Remove Unwanted Elements

Filters out noise elements before extracting text:

| Category | Elements Removed |
|----------|------------------|
| Scripts | `script`, `style`, `noscript`, `iframe` |
| Navigation | `nav`, `header`, `footer`, `aside` |
| Ads/Social | `.ad`, `.ads`, `.advertisement`, `.social-share` |
| UI Elements | `.sidebar`, `.navigation`, `.menu`, `.breadcrumb`, `.comments` |
| ARIA Roles | `[role="navigation"]`, `[role="banner"]`, `[role="contentinfo"]` |
| Forms | `button`, `input`, `select`, `textarea`, `form` |

#### Step 3: TreeWalker Text Extraction

Uses a TreeWalker to visit each node individually, solving the word-merging problem:

**The Problem:**
```html
<p>Hello</p><p>World</p>
```
Using `textContent` returns `"HelloWorld"` — words are merged.

**The Solution:**

The TreeWalker visits nodes in document order:
- **Text nodes**: Extract and trim the text
- **Block elements**: Insert space markers to ensure word separation

Block elements that trigger word breaks: `P`, `DIV`, `H1-H6`, `LI`, `TD`, `TH`, `TR`, `BLOCKQUOTE`, `PRE`, `BR`, `HR`, `SECTION`, `ARTICLE`

#### Step 4: Split into Words

```javascript
text.split(/\s+/).filter(word => word.length > 0)
```

Splits on any whitespace and removes empty strings.

---

### Focus Letter Algorithm

RSVP reading is more effective when your eye has a consistent anchor point. The "Optimal Recognition Point" (ORP) is positioned at roughly 20-30% into each word.

```javascript
getFocusLetterIndex(word) {
  const len = word.length;
  if (len === 1) return 0;
  if (len <= 5) return 1;
  if (len <= 9) return 2;
  if (len <= 13) return 3;
  return 4;
}
```

| Word Length | Focus Position | Example |
|-------------|----------------|---------|
| 1 letter | 1st | **I** |
| 2-5 letters | 2nd | h**e**llo |
| 6-9 letters | 3rd | re**a**ding |
| 10-13 letters | 4th | inf**o**rmation |
| 14+ letters | 5th | inte**r**nationally |

**Why this works:**
- Reading is not linear — your eye doesn't scan character by character
- Word recognition happens at a glance from a central fixation point
- English words have more information density early in the word

The focus letter is styled with an orange highlight (`#ff6b35`) and a subtle glow effect.

---

### Speed & Timing

The interval between words is calculated as:

```javascript
const interval = 60000 / wpm;  // milliseconds per word
```

| WPM | Interval | Words/Second |
|-----|----------|--------------|
| 100 | 600ms | 1.67 |
| 200 | 300ms | 3.33 |
| 300 | 200ms | 5.00 |
| 500 | 120ms | 8.33 |
| 1000 | 60ms | 16.67 |

Speed adjusts in increments of 50 WPM, clamped between 100-1000.

---

## Project Structure

```
├── manifest.json      # Extension configuration (MV3)
├── background.js      # Service worker for keyboard shortcuts
├── popup.html/css/js  # Extension popup interface
├── content.js/css     # RSVP reader overlay and logic
└── icon16/48/128.png  # Extension icons
```

## Browser Compatibility

| Browser | Status |
|---------|--------|
| Chrome/Chromium | Tested |
| Edge | Should work |
| Brave | Should work |
| Other Chromium browsers | Likely compatible |

## Limitations

- Works best on standard article pages
- May not work well on highly dynamic SPAs
- Cannot extract text from PDFs or images
- Some sites with aggressive styling may affect text extraction

## Future Enhancements

- [ ] Multi-language support
- [ ] Reading statistics and history
- [ ] Custom color themes
- [ ] Word pause on punctuation
- [ ] Export reading progress
- [ ] PDF file support

---

Built with vanilla JavaScript, CSS3, and Chrome Extension Manifest V3. No dependencies.
