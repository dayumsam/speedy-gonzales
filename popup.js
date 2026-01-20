// Load saved settings
chrome.storage.sync.get(['wpm', 'fontSize', 'highlightFocus'], (data) => {
  document.getElementById('wpm').value = data.wpm || 300;
  document.getElementById('fontSize').value = data.fontSize || 48;
  document.getElementById('highlightFocus').checked = data.highlightFocus !== false;
  
  updateValue('wpm', data.wpm || 300);
  updateValue('fontSize', data.fontSize || 48);
});

// Update display values
function updateValue(id, value) {
  const suffix = id === 'wpm' ? ' WPM' : 'px';
  document.getElementById(`${id}-value`).textContent = value + suffix;
}

// Handle slider changes
document.getElementById('wpm').addEventListener('input', (e) => {
  updateValue('wpm', e.target.value);
  chrome.storage.sync.set({ wpm: parseInt(e.target.value) });
});

document.getElementById('fontSize').addEventListener('input', (e) => {
  updateValue('fontSize', e.target.value);
  chrome.storage.sync.set({ fontSize: parseInt(e.target.value) });
});

document.getElementById('highlightFocus').addEventListener('change', (e) => {
  chrome.storage.sync.set({ highlightFocus: e.target.checked });
});

// Start reading button
document.getElementById('startBtn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  // Get current settings
  const wpm = parseInt(document.getElementById('wpm').value);
  const fontSize = parseInt(document.getElementById('fontSize').value);
  const highlightFocus = document.getElementById('highlightFocus').checked;
  
  // Send message to content script to start RSVP
  chrome.tabs.sendMessage(tab.id, {
    action: 'startRSVP',
    settings: { wpm, fontSize, highlightFocus }
  });
  
  window.close();
});
