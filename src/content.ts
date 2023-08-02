import { State } from "./background";
import { pixelToNumber } from "./util/unit";
import { getElementByXPath, getXPathForElement } from "./util/xpath";

const ELEMENT_COLOR = "rgba(137, 196, 244, 0.3)";
const PADDING_COLOR = "rgba(178, 222, 39, 0.3)";
const MARGIN_COLOR = "rgba(251, 192, 147, 0.3)";

const selectedElements: Map<string, DrawBoxElement[]> = new Map<string, DrawBoxElement[]>();

const render = async () => {
  if (selectedElements.size == 0) return;
  highlightSelectedElements();
}

const highlightSelectedElements = () => {
  selectedElements.forEach((mountedElems, xpath) => {
    let elem = getElementByXPath(xpath) as HTMLElement;
    mountedElems.forEach(elem => elem.remove());
    let newMountedElems = highlightElement(elem);
    selectedElements.set(xpath, newMountedElems);
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
    selectHoverDiv.remove();
    document.removeEventListener('mousemove', mousemoveEventListener);
    document.removeEventListener('click', clickEventListener);
  }

  const clickEventListener = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const hoveredElement = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | undefined;
    if (!hoveredElement) return;
    // Add selected element to selected list
    let xpath = getXPathForElement(hoveredElement);

    // Highlight element
    let mountedElems = highlightElement(hoveredElement);
    selectedElements.set(xpath, mountedElems);
    unsubscribe();
  }

  document.addEventListener('mousemove', mousemoveEventListener);
  document.addEventListener('click', clickEventListener);
}

// Highlights element
const highlightElement = (element: HTMLElement) => {
  // Draw initial box element
  const elementRect = element.getBoundingClientRect();
  const elementStyle = window.getComputedStyle(element);
  let left = elementRect.left + pixelToNumber(elementStyle.paddingLeft) + window.scrollX;
  let top = elementRect.top + pixelToNumber(elementStyle.paddingTop) + window.scrollY;
  let width = elementRect.width - pixelToNumber(elementStyle.paddingLeft) - pixelToNumber(elementStyle.paddingRight);
  let height = elementRect.height - pixelToNumber(elementStyle.paddingBottom) - pixelToNumber(elementStyle.paddingTop);
  const elementBoxDiv = drawBox(left, top, width, height, 9999, ELEMENT_COLOR);

  // Draw padding box
  left = elementRect.left + window.scrollX;
  top = elementRect.top + window.scrollY;
  width = elementRect.width;
  height = elementRect.height;
  const paddingBoxDiv = drawBox(left, top, width, height, 10000, PADDING_COLOR);

  // Draw margin box
  left = elementRect.left - pixelToNumber(elementStyle.marginLeft) + window.scrollX;
  top = elementRect.top - pixelToNumber(elementStyle.marginTop) + window.scrollY;
  width = elementRect.width + pixelToNumber(elementStyle.marginLeft) + pixelToNumber(elementStyle.marginRight);
  height = elementRect.height + pixelToNumber(elementStyle.marginTop) + pixelToNumber(elementStyle.marginBottom);
  const marginBoxDiv = drawBox(left, top, width, height, 10001, MARGIN_COLOR);


  return [...elementBoxDiv, ...paddingBoxDiv, ...marginBoxDiv];
}

type DrawBoxElement = HTMLDivElement | HTMLSpanElement;

const drawBox = (left: number, top: number, width: number, height: number, zIndex: number, color: string): DrawBoxElement[] => {
  const div = document.createElement("div");
  const style = div.style;
  style.position = "absolute";
  style.backgroundColor = color;
  style.opacity = "0.5";
  style.zIndex = `${zIndex}`;
  style.pointerEvents = "none";
  style.display = "block";
  style.left = `${left}px`;
  style.top = `${top}px`;
  style.width = `${width}px`;
  style.height = `${height}px`;

  document.body.appendChild(div);

  const span = document.createElement("span");
  span.innerText = `${width} x ${height}`
  const spanStyle = span.style;
  spanStyle.fontSize = "10px";
  spanStyle.color = "grey";
  spanStyle.pointerEvents = "none";
  spanStyle.left = `${left}px`;
  spanStyle.top = `${top}px`;
  spanStyle.position = "absolute";
  spanStyle.display = "block";

  document.body.appendChild(span);
  return [div, span];
}

chrome.runtime.onMessage.addListener(async (message) => {
  if (message.type == "refresh-content-script") {
    const storage = await chrome.storage.local.get("isEnabled") as State;
    if (!storage.isEnabled) {
      location.reload();
    } else {
      highlightSelectedElements();
    }
  } else if (message.type == "select-element") {
    handleHoverElement();
  }
});

render();
setInterval(render, 1500);
