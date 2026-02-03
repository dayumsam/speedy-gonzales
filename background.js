// Inject content script and CSS into tab
async function injectContentScript(tabId) {
  try {
    // Check if already injected by sending a ping
    await chrome.tabs.sendMessage(tabId, { action: 'ping' });
  } catch {
    // Not injected yet, inject now
    await chrome.scripting.insertCSS({
      target: { tabId },
      files: ['content.css']
    });
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['content.js']
    });
  }
}

// Start RSVP reader on a tab
async function startRSVP(tab) {
  if (!tab || !tab.id) return;

  // Inject scripts first
  await injectContentScript(tab.id);

  // Small delay to ensure script is ready
  await new Promise(resolve => setTimeout(resolve, 50));

  // Load settings from storage
  const result = await chrome.storage.sync.get({
    wpm: 300,
    fontSize: 48,
    highlightFocus: true
  });

  // Send message to content script to start RSVP
  chrome.tabs.sendMessage(tab.id, {
    action: 'startRSVP',
    settings: {
      wpm: result.wpm,
      fontSize: result.fontSize,
      highlightFocus: result.highlightFocus
    }
  });
}

// Listen for keyboard shortcut command
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'start-rsvp') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    startRSVP(tab);
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startFromPopup') {
    chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
      startRSVP(tab);
    });
  }
});
