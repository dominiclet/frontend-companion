export interface State {
  isEnabled: boolean;
}

// Save default preferences
chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === 'install') {
    const state: State = {
      isEnabled: false,
    }
    chrome.storage.local.set(state);
  }
})

