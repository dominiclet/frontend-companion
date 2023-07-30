import { State } from "./background";

const onPageStartOrChange = async () => {
  const storage = await chrome.storage.local.get("isEnabled");
  if (!storage.isEnabled) return;
  highlightAllElements();
}

const highlightAllElements = () => {
  const allElements = Array.from(document.getElementsByTagName("*") as HTMLCollectionOf<HTMLElement>);

  allElements.forEach(element => {
    element.style.border = "1px dashed red";
  });
}

chrome.runtime.onMessage.addListener(async (message) => {
  if (message.type == "refresh-content-script") {
    const storage = await chrome.storage.local.get("isEnabled") as State;
    if (!storage.isEnabled) {
      location.reload();
    } else {
      highlightAllElements();
    }
  }
});

onPageStartOrChange();
setInterval(onPageStartOrChange, 3000);
