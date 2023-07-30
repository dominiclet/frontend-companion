const toggleHandler = () => {
    chrome.storage.local.get("isEnabled")
      .then(storage => {
        const newIsEnabled = !storage.isEnabled;
        return newIsEnabled;
      })
      .then((isEnabled) => {
        chrome.storage.local.set({ "isEnabled": isEnabled });
      }).then(() => {
        refreshPopup();
        refreshContentScripts();
      });
}

const refreshContentScripts = () => {
  chrome.tabs.query({}, tabs => {
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, {
        "type": "refresh-content-script",
      });
    });
  });

}

const refreshPopup = async () => {
  const storage = await chrome.storage.local.get("isEnabled");
  document.getElementById("enabled-display").innerText = storage.isEnabled ? "Enabled" : "Disabled";
}

refreshPopup();
document.getElementById("toggle").addEventListener("click", toggleHandler);
