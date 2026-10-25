/**
 * DevTools device emulation (Chrome's device toolbar, Firefox's responsive mode) reports
 * ResizeObserver's `devicePixelContentBoxSize` in the host screen's pixels while `devicePixelRatio`
 * is the emulated one. xterm sizes its canvases from the first and draws glyphs with the second, so
 * an emulated phone shows giant, cut-off text and a second logo. Real devices agree on both, so this
 * is installed on the dev server only: when the two disagree, the device box is recomputed from the
 * CSS box and `devicePixelRatio`.
 */
export function installDevicePixelShim(): void {
  const NativeResizeObserver = window.ResizeObserver;
  window.ResizeObserver = class extends NativeResizeObserver {
    constructor(callback: ResizeObserverCallback) {
      super((entries, observer) => callback(entries.map(emulatedDeviceBox), observer));
    }
  };
}

function emulatedDeviceBox(entry: ResizeObserverEntry): ResizeObserverEntry {
  const device = entry.devicePixelContentBoxSize?.[0];
  const css = entry.contentBoxSize?.[0];
  if (!device || !css) return entry;
  const dpr = window.devicePixelRatio;
  const inlineSize = Math.round(css.inlineSize * dpr);
  const blockSize = Math.round(css.blockSize * dpr);
  if (Math.abs(device.inlineSize - inlineSize) <= 1 && Math.abs(device.blockSize - blockSize) <= 1) return entry;
  // The entry's fields are prototype getters, so copy the ones readers use
  return {
    target: entry.target,
    contentRect: entry.contentRect,
    borderBoxSize: entry.borderBoxSize,
    contentBoxSize: entry.contentBoxSize,
    devicePixelContentBoxSize: [{ inlineSize, blockSize }],
  };
}
