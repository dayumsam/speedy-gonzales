// Listen for keyboard shortcut command
chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'start-rsvp') {
    // Get the active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) return;

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
});
