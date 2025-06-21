import { useEffect, useRef } from "react";
import { canvasHeight, canvasWidth, stateRef } from "./consts";
import { usePlaceImage } from "./hooks";

export function Canvas() {
  const runOnceRef = useRef(false);
  const placeImage = usePlaceImage();

  useEffect(() => {
    if (runOnceRef.current) return;
    runOnceRef.current = true;
    const images = [
      "bird.jpg",
      "farm.jpg",
      "octopus.jpg",
      "sunset.jpg",
      "turtle.jpg",
    ];
    const url = "/images/" + images[Math.floor(Math.random() * images.length)];
    placeImage(url);
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
