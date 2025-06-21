export const canvasWidth = 1280;
export const canvasHeight = 1280;
export const frameBufferWidth = 2048;
export const frameBufferHeight = 2048;

const frameBuffer = document.createElement("canvas");
frameBuffer.width = frameBufferWidth;
frameBuffer.height = frameBufferHeight;
const ftx = frameBuffer.getContext("2d")!;
ftx.imageSmoothingEnabled = false;

const faviconCanvas = document.createElement("canvas");
faviconCanvas.width = 64;
faviconCanvas.height = 64;
const faviconCtx = faviconCanvas.getContext("2d")!;

export const stateRef = {
  camera: { x: 0, y: 0, z: 1 },
  zoomContainer: null as HTMLDivElement | null,
  frameBuffer,
  renderCanvas: null as HTMLCanvasElement | null,
  ftx,
  rtx: null as CanvasRenderingContext2D | null,
  faviconCanvas,
  faviconCtx,
  faviconEl: document.querySelector<HTMLLinkElement>("link[rel='icon']")!,
  imageURL: "",
};
