export function getXPathForElement(element: HTMLElement) {
  // @ts-ignore
    const idx = (sib, name) => sib 
        ? idx(sib.previousElementSibling, name||sib.localName) + (sib.localName == name)
        : 1;
  // @ts-ignore
    const segs = elm => !elm || elm.nodeType !== 1 
        ? ['']
        : elm.id && document.getElementById(elm.id) === elm
            ? [`id("${elm.id}")`]
      //@ts-ignore
            : [...segs(elm.parentNode), `${elm.localName.toLowerCase()}[${idx(elm)}]`]; 
    return segs(element).join('/');
}

export function getElementByXPath(path: string) { 
    return (new XPathEvaluator()) 
        .evaluate(path, document.documentElement, null, 
                        XPathResult.FIRST_ORDERED_NODE_TYPE, null) 
        .singleNodeValue; 
} 

