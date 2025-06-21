import { useAtom } from "jotai";
import { useRef, useEffect } from "react";
import { IsPanningAtom } from "./Atoms";

export function Cursor() {
  const rakeRef = useRef<HTMLDivElement | null>(null);
  const positionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const prevPositionRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const prevAngleRef = useRef(0);
  const smoothedRef = useRef({ dx: 0, dy: 0 });
  const [isPanning] = useAtom(IsPanningAtom);

  useEffect(() => {
    const smoothing = 0.2;

    const handlePointerMove = (event: PointerEvent) => {
      positionRef.current = { x: event.clientX, y: event.clientY };
      const pos = positionRef.current;
      const prev = prevPositionRef.current;

      const dx = pos.x - prev.x;
      const dy = pos.y - prev.y;

      smoothedRef.current.dx =
        smoothedRef.current.dx * (1 - smoothing) + dx * smoothing;
      smoothedRef.current.dy =
        smoothedRef.current.dy * (1 - smoothing) + dy * smoothing;

      const angle =
        dx * dx + dy * dy < 2
          ? prevAngleRef.current
          : Math.atan2(smoothedRef.current.dy, smoothedRef.current.dx) -
            Math.PI / 2;

      // Update DOM
      if (rakeRef.current) {
        rakeRef.current.style.transform = `translate(-50%, -50%) translate(${pos.x}px, ${pos.y}px)`;
      }
      prevPositionRef.current = { ...pos };
      prevAngleRef.current = angle;
    };

    window.addEventListener("pointermove", handlePointerMove);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, []);

  if (isPanning) return null;

  return (
    <div
      ref={rakeRef}
      style={{
        pointerEvents: "none",
        width: 48,
        height: 48,
        transformOrigin: "center",
        boxShadow: "0 0 4px rgba(0, 0, 0, 0.8)",
        border: "solid 2px rgba(255, 255, 255, 0.8)",
        borderRadius: "50%",
        position: "fixed",
        left: 0,
        top: 0,
        transform: "translate(-1000px, -1000px)",
      }}
    ></div>
  );
}
