import { canvasHeight, canvasWidth, stateRef } from "./consts";
import { Camera, Point } from "./Types";

export function screenToCanvas(
  point: Point,
  camera: Camera,
  container: HTMLDivElement,
) {
  const x = (point.x - container.clientWidth / 2) / camera.z - camera.x;
  const y = (point.y - container.clientHeight / 2) / camera.z - camera.y;
  return { x, y };
}

export function canvasToScreen(
  point: Point,
  camera: Camera,
  container: HTMLDivElement,
) {
  const x = (point.x + camera.x) * camera.z + container.clientWidth / 2;
  const y = (point.y + camera.y) * camera.z + container.clientHeight / 2;
  return { x, y };
}

export function panCamera(camera: Camera, dx: number, dy: number): Camera {
  return {
    x: camera.x - dx / camera.z,
    y: camera.y - dy / camera.z,
    z: camera.z,
  };
}

export function zoomCamera(
  camera: Camera,
  point: Point,
  dz: number,
  container: HTMLDivElement,
): Camera {
  const zoom = camera.z - dz * camera.z;

  const p1 = screenToCanvas(point, camera, container);

  const p2 = screenToCanvas(point, { ...camera, z: zoom }, container);

  return {
    x: camera.x + p2.x - p1.x,
    y: camera.y + p2.y - p1.y,
    z: zoom,
  };
}

// load image as promise
export const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

export function rotatePoint(
  x: number,
  y: number,
  cx: number,
  cy: number,
  angleRad: number,
): { x: number; y: number } {
  const cos = Math.cos(angleRad);
  const sin = Math.sin(angleRad);

  const dx = x - cx;
  const dy = y - cy;

  return {
    x: cx + dx * cos - dy * sin,
    y: cy + dx * sin + dy * cos,
  };
}

export function makeCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Failed to get canvas context");
  ctx.imageSmoothingEnabled = false;
  return canvas;
}

export async function placeImage(url: string) {
  const image = await loadImage(url);
  const minSize = 1280;
  let width = image.width;
  let height = image.height;
  const aspectRatio = width / height;
  const containerAspectRatio = 1;
  // cover container
  if (aspectRatio > containerAspectRatio) {
    height = minSize;
    width = minSize * aspectRatio;
  } else {
    width = minSize;
    height = minSize / aspectRatio;
  }
  stateRef.rtx!.drawImage(
    image,
    stateRef.renderCanvas!.width / 2 - width / 2,
    stateRef.renderCanvas!.height / 2 - height / 2,
    width,
    height,
  );
}

export function drawToFavicon() {
  if (!stateRef.faviconEl) return;
  stateRef.faviconCtx.clearRect(0, 0, 64, 64);
  stateRef.faviconCtx.drawImage(
    stateRef.renderCanvas!,
    0,
    0,
    canvasWidth,
    canvasHeight,
    0,
    0,
    64,
    64,
  );
  const faviconURL = stateRef.faviconCanvas.toDataURL("image/png");
  stateRef.faviconEl.href = faviconURL;
}


function isIOS() {
  // @ts-ignore
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

export async function shareOrDownload(canvas: HTMLCanvasElement) {
  const blob = await new Promise<Blob>(resolve =>
    canvas.toBlob(blob => resolve(blob!), "image/png")
  );
  const file = new File([blob], "image.png", { type: "image/png" });

  if (
    isIOS() &&
    navigator.canShare &&
    navigator.canShare({ files: [file] })
  ) {
    try {
      await navigator.share({
        title: "Image",
        files: [file],
      });
    } catch (err) {
      console.error("Share failed:", err);
    }
  } else {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const timestamp = new Date().toISOString().replace(/[:.T]/g, "-").replace('Z','').split('-').slice(0, 5).join('-');
    link.download = `image-paint-${timestamp}.png`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
