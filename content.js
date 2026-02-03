// Extract readable text from the page
function extractArticleText() {
  // Try to find the main article content
  const selectors = [
    'article',
    '[role="main"]',
    'main',
    '.article-content',
    '.post-content',
    '.entry-content',
    '.content',
    'body'
  ];

  let content = null;
  for (const selector of selectors) {
    content = document.querySelector(selector);
    if (content && content.textContent.trim().length > 100) {
      break;
    }
  }

  if (!content) {
    content = document.body;
  }

  // Clone the content to avoid modifying the original
  const clone = content.cloneNode(true);

  // Remove unwanted elements
  const unwantedSelectors = [
    'script', 'style', 'noscript', 'iframe',
    'nav', 'header', 'footer', 'aside',
    '.ad', '.ads', '.advertisement', '.social-share', '.comments',
    '.sidebar', '.navigation', '.menu', '.breadcrumb',
    '[role="navigation"]', '[role="banner"]', '[role="contentinfo"]',
    'button', 'input', 'select', 'textarea', 'form'
  ];
  const unwanted = clone.querySelectorAll(unwantedSelectors.join(', '));
  unwanted.forEach(el => el.remove());

  // Block-level elements that should introduce word breaks
  const blockElements = new Set([
    'P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
    'LI', 'TD', 'TH', 'TR', 'BLOCKQUOTE', 'PRE',
    'SECTION', 'ARTICLE', 'HEADER', 'FOOTER',
    'BR', 'HR'
  ]);

  // Walk through all nodes and extract text with proper spacing
  const textParts = [];
  const walker = document.createTreeWalker(
    clone,
    NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
    null,
    false
  );

  let node;
  while ((node = walker.nextNode())) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent.trim();
      if (text) {
        textParts.push(text);
      }
    } else if (node.nodeType === Node.ELEMENT_NODE && blockElements.has(node.tagName)) {
      // Add a space marker for block elements to ensure word separation
      if (textParts.length > 0 && textParts[textParts.length - 1] !== ' ') {
        textParts.push(' ');
      }
    }
  }

  // Join and clean up the text
  let text = textParts.join(' ');

  // Normalize whitespace
  text = text.replace(/\s+/g, ' ').trim();

  // Split into words and filter
  return text.split(/\s+/).filter(word => word.length > 0);
}

// Create RSVP overlay
function createRSVPOverlay(settings) {
  const overlay = document.createElement('div');
  overlay.id = 'rsvp-overlay';
  overlay.innerHTML = `
    <div class="rsvp-container">
      <div class="rsvp-header">
        <div class="rsvp-progress">
          <div class="rsvp-progress-bar"></div>
        </div>
        <div class="rsvp-stats">
          <span class="rsvp-word-count">0 / 0</span>
          <span class="rsvp-time">0:00</span>
        </div>
      </div>
      
      <div class="rsvp-display">
        <div class="rsvp-word"></div>
      </div>
      
      <div class="rsvp-controls">
        <button class="rsvp-btn" id="rsvp-play">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        </button>
        <button class="rsvp-btn" id="rsvp-pause" style="display: none;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16"></rect>
            <rect x="14" y="4" width="4" height="16"></rect>
          </svg>
        </button>
        <button class="rsvp-btn" id="rsvp-restart">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="1 4 1 10 7 10"></polyline>
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
          </svg>
        </button>
        <button class="rsvp-btn rsvp-close" id="rsvp-close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      
      <div class="rsvp-speed-control">
        <button class="rsvp-speed-btn" id="rsvp-slower">−50</button>
        <span class="rsvp-current-wpm">${settings.wpm} WPM</span>
        <button class="rsvp-speed-btn" id="rsvp-faster">+50</button>
      </div>

      <div class="rsvp-timeline">
        <div class="rsvp-timeline-track">
          <div class="rsvp-timeline-progress"></div>
          <div class="rsvp-timeline-handle"></div>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(overlay);
  return overlay;
}

// RSVP Reader class
class RSVPReader {
  constructor(words, settings) {
    this.words = words;
    this.settings = settings;
    this.currentIndex = 0;
    this.isPlaying = false;
    this.intervalId = null;
    this.startTime = null;
    this.pausedTime = 0;
    
    this.overlay = createRSVPOverlay(settings);
    this.wordDisplay = this.overlay.querySelector('.rsvp-word');
    this.progressBar = this.overlay.querySelector('.rsvp-progress-bar');
    this.wordCount = this.overlay.querySelector('.rsvp-word-count');
    this.timeDisplay = this.overlay.querySelector('.rsvp-time');
    this.wpmDisplay = this.overlay.querySelector('.rsvp-current-wpm');
    this.timelineTrack = this.overlay.querySelector('.rsvp-timeline-track');
    this.timelineProgress = this.overlay.querySelector('.rsvp-timeline-progress');
    this.timelineHandle = this.overlay.querySelector('.rsvp-timeline-handle');

    this.setupEventListeners();
    this.updateDisplay();
    this.updateTimeline();
  }
  
  setupEventListeners() {
    this.overlay.querySelector('#rsvp-play').addEventListener('click', () => this.play());
    this.overlay.querySelector('#rsvp-pause').addEventListener('click', () => this.pause());
    this.overlay.querySelector('#rsvp-restart').addEventListener('click', () => this.restart());
    this.overlay.querySelector('#rsvp-close').addEventListener('click', () => this.close());
    this.overlay.querySelector('#rsvp-slower').addEventListener('click', () => this.adjustSpeed(-50));
    this.overlay.querySelector('#rsvp-faster').addEventListener('click', () => this.adjustSpeed(50));

    // Timeline scrubbing
    let isDragging = false;

    const seekToPosition = (e) => {
      const rect = this.timelineTrack.getBoundingClientRect();
      const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const newIndex = Math.floor(percent * this.words.length);
      this.seekTo(newIndex);
    };

    this.timelineTrack.addEventListener('click', seekToPosition);

    this.timelineHandle.addEventListener('mousedown', (e) => {
      isDragging = true;
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (isDragging) {
        seekToPosition(e);
      }
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
    });

    // Keyboard controls
    document.addEventListener('keydown', (e) => {
      if (e.key === ' ' && e.target === document.body) {
        e.preventDefault();
        this.isPlaying ? this.pause() : this.play();
      } else if (e.key === 'Escape') {
        this.close();
      } else if (e.key === 'r' || e.key === 'R') {
        this.restart();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.seekTo(Math.max(0, this.currentIndex - 10));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.seekTo(Math.min(this.words.length - 1, this.currentIndex + 10));
      }
    });
  }

  seekTo(index) {
    const wasPlaying = this.isPlaying;
    if (wasPlaying) this.pause();

    this.currentIndex = index;
    this.updateDisplay();
    this.updateProgress();
    this.updateTimeline();

    if (wasPlaying) this.play();
  }

  updateTimeline() {
    const progress = this.words.length > 0 ? (this.currentIndex / this.words.length) * 100 : 0;
    this.timelineProgress.style.width = `${progress}%`;
    this.timelineHandle.style.left = `${progress}%`;
  }
  
  play() {
    if (this.isPlaying) return;

    this.isPlaying = true;
    this.overlay.classList.add('is-playing');
    this.overlay.querySelector('#rsvp-play').style.display = 'none';
    this.overlay.querySelector('#rsvp-pause').style.display = 'block';
    
    if (!this.startTime) {
      this.startTime = Date.now();
    } else {
      this.startTime = Date.now() - this.pausedTime;
    }
    
    const interval = 60000 / this.settings.wpm; // milliseconds per word
    this.intervalId = setInterval(() => {
      if (this.currentIndex < this.words.length) {
        this.showWord(this.words[this.currentIndex]);
        this.currentIndex++;
        this.updateProgress();
      } else {
        this.pause();
      }
    }, interval);
  }
  
  pause() {
    if (!this.isPlaying) return;

    this.isPlaying = false;
    this.overlay.classList.remove('is-playing');
    this.overlay.querySelector('#rsvp-play').style.display = 'block';
    this.overlay.querySelector('#rsvp-pause').style.display = 'none';
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    if (this.startTime) {
      this.pausedTime = Date.now() - this.startTime;
    }
  }
  
  restart() {
    this.pause();
    this.currentIndex = 0;
    this.startTime = null;
    this.pausedTime = 0;
    this.updateDisplay();
    this.updateProgress();
  }
  
  close() {
    this.pause();
    if (this.overlay) {
      this.overlay.remove();
    }
  }
  
  adjustSpeed(delta) {
    this.settings.wpm = Math.max(100, Math.min(1000, this.settings.wpm + delta));
    this.wpmDisplay.textContent = `${this.settings.wpm} WPM`;
    
    if (this.isPlaying) {
      this.pause();
      this.play();
    }
  }
  
  showWord(word) {
    const focusIndex = this.getFocusLetterIndex(word);
    const before = word.substring(0, focusIndex);
    const focus = word[focusIndex];
    const after = word.substring(focusIndex + 1);

    if (this.settings.highlightFocus) {
      this.wordDisplay.innerHTML = `<span class="word-before">${before}</span><span class="focus-letter">${focus}</span><span class="word-after">${after}</span>`;
    } else {
      this.wordDisplay.innerHTML = `<span class="word-before">${before}</span><span class="focus-letter-plain">${focus}</span><span class="word-after">${after}</span>`;
    }

    this.wordDisplay.style.fontSize = `${this.settings.fontSize}px`;
  }
  
  getFocusLetterIndex(word) {
    const len = word.length;
    if (len === 1) return 0;
    if (len <= 5) return 1;
    if (len <= 9) return 2;
    if (len <= 13) return 3;
    return 4;
  }
  
  updateDisplay() {
    if (this.currentIndex < this.words.length) {
      this.showWord(this.words[this.currentIndex]);
    }
  }
  
  updateProgress() {
    const progress = (this.currentIndex / this.words.length) * 100;
    this.progressBar.style.width = `${progress}%`;
    this.wordCount.textContent = `${this.currentIndex} / ${this.words.length}`;

    const elapsed = this.pausedTime || (this.startTime ? Date.now() - this.startTime : 0);
    const minutes = Math.floor(elapsed / 60000);
    const seconds = Math.floor((elapsed % 60000) / 1000);
    this.timeDisplay.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    this.updateTimeline();
  }
}

// Show loading overlay
function showLoadingOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'rsvp-overlay';
  overlay.innerHTML = `
    <div class="rsvp-loading">
      <div class="rsvp-loading-spinner"></div>
      <p>Extracting text...</p>
    </div>
  `;
  document.body.appendChild(overlay);
  return overlay;
}

// Get selected text if any
function getSelectedText() {
  const selection = window.getSelection();
  const text = selection.toString().trim();
  if (text.length > 0) {
    return text.replace(/\s+/g, ' ').split(/\s+/).filter(word => word.length > 0);
  }
  return null;
}

// Listen for messages from background/popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Ping to check if script is already injected
  if (request.action === 'ping') {
    sendResponse({ status: 'ok' });
    return true;
  }

  if (request.action === 'startRSVP') {
    // Check for selected text first
    const selectedWords = getSelectedText();

    // Remove any existing RSVP overlay
    const existingOverlay = document.getElementById('rsvp-overlay');
    if (existingOverlay) {
      existingOverlay.remove();
    }

    // If text is selected, use it directly without loading screen
    if (selectedWords && selectedWords.length > 0) {
      new RSVPReader(selectedWords, request.settings);
      return;
    }

    // Show loading state for full page extraction
    const loadingOverlay = showLoadingOverlay();

    // Extract text asynchronously to allow UI to render
    setTimeout(() => {
      const words = extractArticleText();

      if (words.length === 0) {
        loadingOverlay.remove();
        alert('No readable text found on this page. Please navigate to an article or webpage with text content.');
        return;
      }

      // Remove loading overlay and create reader
      loadingOverlay.remove();
      new RSVPReader(words, request.settings);
    }, 50);
  }
});
