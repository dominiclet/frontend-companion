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

const selectElementButtonHandler = () => {
  chrome.tabs.query({}, tabs => {
    tabs.forEach(tab => {
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, {
          type: "select-element",
        });
      }
    });
  });
}

const refreshContentScripts = () => {
  chrome.tabs.query({}, tabs => {
    tabs.forEach(tab => {
      if (tab.id) {
        chrome.tabs.sendMessage(tab.id, {
          type: "refresh-content-script",
        });
      }
    });
  });
}

const refreshPopup = async () => {
  const storage = await chrome.storage.local.get("isEnabled");
  (document.getElementById("enabled-display") as HTMLElement).innerText = storage.isEnabled ? "Enabled" : "Disabled";
}

refreshPopup();

(document.getElementById("toggle") as HTMLElement).addEventListener("click", toggleHandler);
(document.getElementById("select") as HTMLElement).addEventListener("click", selectElementButtonHandler);
