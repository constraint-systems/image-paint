import { useEffect, useRef } from "react";
import { canvasHeight, canvasWidth, stateRef } from "./consts";
import { loadImage } from "./Utils";

export function Canvas() {
  const runOnceRef = useRef(false);
  useEffect(() => {
    async function loadStarterImage(
      canvas: HTMLCanvasElement,
      ctx: CanvasRenderingContext2D,
    ) {
      runOnceRef.current = true;
      const images = [
        "bird.jpg",
        "farm.jpg",
        "octopus.jpg",
        "sunset.jpg",
        "turtle.jpg",
      ];
      const image = await loadImage(
        "/images/" + images[Math.floor(Math.random() * images.length)],
      );
      const maxWidth = canvas.width;
      const maxHeight = canvas.height;
      const aspectRatio = image.width / image.height;
      let width = maxWidth;
      let height = maxHeight;
      if (image.width > maxWidth || image.height > maxHeight) {
        if (aspectRatio > 1) {
          height = maxWidth / aspectRatio;
        } else {
          width = maxHeight * aspectRatio;
        }
      }
      const x = canvas.width / 2 - image.width / 2;
      const y = canvas.height / 2 - image.height / 2;

      ctx.drawImage(image, x, y, image.width, image.height);
    }

    async function main() {
      if (stateRef.rtx && stateRef.renderCanvas && !runOnceRef.current) {
        runOnceRef.current = true;
        await loadStarterImage(stateRef.renderCanvas, stateRef.rtx);
      }
    }
    main();
  }, []);

  return (
    <>
      <canvas
        ref={(canvas) => {
          if (canvas && !stateRef.rtx) {
            stateRef.renderCanvas = canvas;
            stateRef.rtx = canvas.getContext("2d")!;
            stateRef.rtx.imageSmoothingEnabled = false;
          }
        }}
        className="absolute bg-black left-0 top-0"
        style={{
          imageRendering: "pixelated",
        }}
        width={canvasWidth}
        height={canvasHeight}
      />
    </>
  );
}
