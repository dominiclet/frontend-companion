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

const handleHoverElement = () => {
  const selectHoverDiv = document.createElement("div");
  const style = selectHoverDiv.style;
  style.position = "absolute";
  style.backgroundColor = "blue";
  style.opacity = "0.5";
  style.display = "none";
  style.zIndex = "9999";
  style.pointerEvents = "none";

  document.body.appendChild(selectHoverDiv);

  const mousemoveEventListener = (e: MouseEvent) => {
    const hoveredElement = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | undefined;
    if (hoveredElement) {
      var viewportOffset = hoveredElement.getBoundingClientRect();
      var left = viewportOffset.left + window.scrollX;
      var top = viewportOffset.top + window.scrollY;
      style.display = "block";
      style.left = `${left}px`;
      style.top = `${top}px`;
      style.width = `${viewportOffset.width.toString()}px`;
      style.height = `${viewportOffset.height.toString()}px`;
    } else {
      style.display = "none";
    }
  }

  const unsubscribe = () => {
    document.removeEventListener('mousemove', mousemoveEventListener);
    document.removeEventListener('click', clickEventListener);
  }

  const clickEventListener = (e: MouseEvent) => {
    e.stopPropagation();
    const hoveredElement = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | undefined;
    console.log(hoveredElement);
    unsubscribe();
  }

  document.addEventListener('mousemove', mousemoveEventListener);
  document.addEventListener('click', clickEventListener);
}

chrome.runtime.onMessage.addListener(async (message) => {
  if (message.type == "refresh-content-script") {
    const storage = await chrome.storage.local.get("isEnabled") as State;
    if (!storage.isEnabled) {
      location.reload();
    } else {
      highlightAllElements();
    }
  } else if (message.type == "select-element") {
    handleHoverElement();
  }
});

onPageStartOrChange();
setInterval(onPageStartOrChange, 3000);
