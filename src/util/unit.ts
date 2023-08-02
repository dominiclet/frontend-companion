export function pixelToNumber(pixels: string) {
  if (!pixels) return 0;
  let str = pixels.replace("px", "");
  return parseInt(str);
}
