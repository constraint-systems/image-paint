import { useRef, useEffect } from "react";
import { frameBufferWidth, frameBufferHeight, stateRef } from "./consts";

export function BufferDebug() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = frameBufferWidth;
      canvas.height = frameBufferHeight;
      const ctx = canvas.getContext("2d");
      function render() {
        if (ctx) {
          ctx.clearRect(0, 0, frameBufferWidth, frameBufferHeight);
          ctx.drawImage(
            stateRef.frameBuffer,
            0,
            0,
            frameBufferWidth,
            frameBufferHeight
          );
          requestAnimationFrame(render);
        }
      }
      render();
    }
  }, []);

  return (
    <div className="absolute top-4 right-4">
      <canvas ref={canvasRef} className="w-48 h-48 bg-neutral-800 rounded-full" />
    </div>
  );
}

