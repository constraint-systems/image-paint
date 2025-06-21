import { useAtom } from "jotai";
import { useEffect, useRef } from "react";
import {
  ActionModeAtom,
  CameraAtom,
  CanvasURLAtom,
  IsPanningAtom,
  ZoomContainerAtom,
} from "./Atoms";
import {
  canvasHeight,
  canvasWidth,
  frameBufferHeight,
  frameBufferWidth,
  stateRef,
} from "./consts";
import {
  zoomCamera,
  panCamera,
  screenToCanvas,
  rotatePoint,
  drawToFavicon,
} from "./Utils";
import { Canvas } from "./Canvas";

export function Zoom() {
  const [actionMode] = useAtom(ActionModeAtom);
  const [, setIsPanning] = useAtom(IsPanningAtom);
  const [camera, setCamera] = useAtom(CameraAtom);
  const [zoomContainer, setZoomContainer] = useAtom(ZoomContainerAtom);
  const eventsContainerRef = useRef(null as HTMLDivElement | null);
  const [, setCanvasURL] = useAtom(CanvasURLAtom);

  useEffect(() => {
    stateRef.camera = camera;
  }, [camera]);

  useEffect(() => {
    function handleWheel(event: WheelEvent) {
      if (zoomContainer) {
        event.preventDefault();
        const { clientX: x, clientY: y, deltaX, deltaY, ctrlKey } = event;
        if (ctrlKey) {
          setCamera((camera) =>
            zoomCamera(camera, { x, y }, deltaY / 400, zoomContainer),
          );
        } else {
          if (event.shiftKey) {
            setCamera((camera) => panCamera(camera, deltaY, 0));
          } else {
            setCamera((camera) => panCamera(camera, deltaX, deltaY));
          }
        }
      }
    }
    eventsContainerRef.current!.addEventListener("wheel", handleWheel, {
      passive: false,
    });
    return () =>
      eventsContainerRef.current!.removeEventListener("wheel", handleWheel);
  }, [zoomContainer, setCamera]);

  // for events we want to handle them all together so we can
  // make good decisions about panning
  const activePointersRef = useRef<number[]>([]);
  const activePointersMapRef = useRef<
    Record<
      number,
      {
        screenX: number;
        screenY: number;
        canvasX: number;
        canvasY: number;
        offsetX?: number;
        offsetY?: number;
      }
    >
  >({});
  const isDraggingRef = useRef(false);
  const isPanningRef = useRef(false);
  const isPlacingImageRef = useRef(false);

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    (event.target as HTMLCanvasElement).setPointerCapture(event.pointerId);
    if (event.button !== 0) return; // Only handle left click

    const canvasPoint = screenToCanvas(
      { x: event.clientX, y: event.clientY },
      stateRef.camera,
      stateRef.zoomContainer!,
    );

    activePointersRef.current.push(event.pointerId);
    activePointersMapRef.current[event.pointerId] = {
      screenX: event.clientX,
      screenY: event.clientY,
      canvasX: canvasPoint.x,
      canvasY: canvasPoint.y,
    };

    if (activePointersRef.current.length === 1) {
      isPanningRef.current = false;
      isDraggingRef.current = true;
      isPlacingImageRef.current = false;
    } else if (activePointersRef.current.length === 2) {
      isDraggingRef.current = false;
      isPlacingImageRef.current = false;
      isPanningRef.current = true;
      setIsPanning(true);
    } else {
      isDraggingRef.current = false;
      isPlacingImageRef.current = false;
      isPanningRef.current = false;
    }
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const canvasPoint = screenToCanvas(
      { x: event.clientX, y: event.clientY },
      stateRef.camera,
      stateRef.zoomContainer!,
    );

    if (isPanningRef.current) {
      const averagePrevPoint = {
        x:
          (activePointersMapRef.current[activePointersRef.current[0]].screenX +
            activePointersMapRef.current[activePointersRef.current[1]]
              .screenX) /
          2,
        y:
          (activePointersMapRef.current[activePointersRef.current[0]].screenY +
            activePointersMapRef.current[activePointersRef.current[1]]
              .screenY) /
          2,
      };
      const prevDistance = Math.hypot(
        activePointersMapRef.current[activePointersRef.current[0]].screenX -
          activePointersMapRef.current[activePointersRef.current[1]].screenX,
        activePointersMapRef.current[activePointersRef.current[0]].screenY -
          activePointersMapRef.current[activePointersRef.current[1]].screenY,
      );
      activePointersMapRef.current[event.pointerId] = {
        screenX: event.clientX,
        screenY: event.clientY,
        canvasX: canvasPoint.x,
        canvasY: canvasPoint.y,
      };
      const averageCurrentPoint = {
        x:
          (activePointersMapRef.current[activePointersRef.current[0]].screenX +
            activePointersMapRef.current[activePointersRef.current[1]]
              .screenX) /
          2,
        y:
          (activePointersMapRef.current[activePointersRef.current[0]].screenY +
            activePointersMapRef.current[activePointersRef.current[1]]
              .screenY) /
          2,
      };
      const dx = averagePrevPoint.x - averageCurrentPoint.x;
      const dy = averagePrevPoint.y - averageCurrentPoint.y;
      const newDistance = Math.hypot(
        activePointersMapRef.current[activePointersRef.current[0]].screenX -
          activePointersMapRef.current[activePointersRef.current[1]].screenX,
        activePointersMapRef.current[activePointersRef.current[0]].screenY -
          activePointersMapRef.current[activePointersRef.current[1]].screenY,
      );

      setCamera((camera) =>
        zoomCamera(
          panCamera(camera, dx, dy),
          { x: averageCurrentPoint.x, y: averageCurrentPoint.y },
          (prevDistance - newDistance) / 200,
          stateRef.zoomContainer!,
        ),
      );
    } else if (isDraggingRef.current) {
      const prevImagePoint = {
        x:
          activePointersMapRef.current[activePointersRef.current[0]].canvasX +
          canvasWidth / 2,
        y:
          activePointersMapRef.current[activePointersRef.current[0]].canvasY +
          canvasHeight / 2,
      };
      const imagePoint = {
        x: canvasPoint.x + canvasWidth / 2,
        y: canvasPoint.y + canvasHeight / 2,
      };
      activePointersMapRef.current[event.pointerId] = {
        screenX: event.clientX,
        screenY: event.clientY,
        canvasX: canvasPoint.x,
        canvasY: canvasPoint.y,
      };

      let dx = imagePoint.x - prevImagePoint.x;
      let dy = imagePoint.y - prevImagePoint.y;

      if (stateRef.rtx) {
        const broomWidth = (24 * 2) / stateRef.camera.z;

        // All we need going into here is dy and dx, plus pointer position
        const angle = Math.atan2(dy, dx) - Math.PI / 2;

        if (dx * dx + dy * dy < 1 / stateRef.camera.z) return;

        const ftx = stateRef.ftx!;
        const rtx = stateRef.rtx!;

        const rotated = rotatePoint(
          prevImagePoint.x,
          prevImagePoint.y,
          canvasWidth / 2,
          canvasHeight / 2,
          -angle,
        );
        const rotatedNow = rotatePoint(
          imagePoint.x,
          imagePoint.y,
          canvasWidth / 2,
          canvasHeight / 2,
          -angle,
        );

        if (actionMode === "paint") {
          ftx.save();
          ftx.clearRect(0, 0, frameBufferWidth, frameBufferHeight);
          ftx.translate(frameBufferWidth / 2, frameBufferHeight / 2);
          ftx.rotate(-angle);
          ftx.translate(-frameBufferWidth / 2, -frameBufferHeight / 2);
          const x = (frameBufferWidth - canvasWidth) / 2;
          const y = (frameBufferHeight - canvasHeight) / 2;
          ftx.drawImage(
            stateRef.renderCanvas!,
            x,
            y,
            canvasWidth,
            canvasHeight,
          );
          ftx.restore();

          rtx.save();
          rtx.translate(canvasWidth / 2, canvasHeight / 2);
          rtx.rotate(angle);
          rtx.translate(-canvasWidth / 2, -canvasHeight / 2);

          rtx.drawImage(
            stateRef.frameBuffer!,
            rotated.x - broomWidth / 2 + x,
            rotated.y + y,
            broomWidth,
            canvasHeight,
            rotatedNow.x - broomWidth / 2,
            rotatedNow.y,
            broomWidth,
            canvasHeight,
          );
          rtx.restore();
        }

        if (actionMode === "erase") {
          rtx.globalCompositeOperation = "destination-out";
          rtx.beginPath();
          rtx.arc(
            imagePoint.x,
            imagePoint.y,
            broomWidth / 2,
            0,
            Math.PI * 2,
            false,
          );
          rtx.closePath();
          rtx.fill();
          rtx.globalCompositeOperation = "source-over";
        }
      }
    }
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    (event.target as HTMLCanvasElement).releasePointerCapture(event.pointerId);
    activePointersRef.current = activePointersRef.current.filter(
      (id) => id !== event.pointerId,
    );
    delete activePointersMapRef.current[event.pointerId];

    if (activePointersRef.current.length === 1) {
      // make them put finger down again
      isDraggingRef.current = false;
      isPanningRef.current = false;
      isPlacingImageRef.current = false;
      setIsPanning(false);
    } else if (activePointersRef.current.length === 2) {
      isDraggingRef.current = false;
      isPlacingImageRef.current = false;
      isPanningRef.current = true;
    } else {
      isDraggingRef.current = false;
      isPlacingImageRef.current = false;
      isPanningRef.current = false;
      setIsPanning(false);
    }
    setCanvasURL(stateRef.renderCanvas!.toDataURL("image/png"));
    drawToFavicon();
  }

  return (
    <div
      ref={eventsContainerRef}
      className="absolute touch-none select-none top-0 left-0 w-full h-full"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <div
        ref={(div) => {
          if (div) {
            setZoomContainer(div);
            stateRef.zoomContainer = div;
          }
        }}
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: "100%",
          height: "100%",
          transformOrigin: "0 0",
          transform: `scale(${camera.z}) translate(-50%, -50%) translate(${camera.x}px, ${camera.y}px)`,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          className="relative shrink-0 "
          style={{
            width: canvasWidth,
            height: canvasHeight,
          }}
        >
          <Canvas />
        </div>
      </div>
    </div>
  );
}
