import { Zoom } from "./Zoom";
import { Toolbar } from "./Toolbar";
import { useAtom } from "jotai";
import { ActionModeAtom } from "./Atoms";
import { useEffect } from "react";
import { placeImage } from "./Utils";
import { Cursor } from "./Cursor";

function App() {
  const [actionMode] = useAtom(ActionModeAtom);

  useEffect(() => {
    // handle drag and drop image
    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const file = e.dataTransfer?.files?.[0];
      if (
        file &&
        (file.type === "image/png" ||
          file.type === "image/jpeg" ||
          file.type === "image/webp")
      ) {
        const url = URL.createObjectURL(file);
        placeImage(url);
      }
    };
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };
    window.addEventListener("drop", handleDrop);
    window.addEventListener("dragover", handleDragOver);

    // Handle paste image
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (items) {
        for (const item of items) {
          if (item.kind === "file" && item.type.startsWith("image/")) {
            const file = item.getAsFile();
            if (file) {
              const url = URL.createObjectURL(file);
              placeImage(url);
            }
          }
        }
      }
    };
    window.addEventListener("paste", handlePaste);

    return () => {
      window.removeEventListener("drop", handleDrop);
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("paste", handlePaste);
    };
  }, []);

  return (
    <div className="w-full h-[100dvh] bg-neutral-900 relative overflow-hidden flex flex-col">
      <div className={`grow ${actionMode === "place" ? "" : "cursor-none"}`}>
        <Zoom />
      </div>
      <Toolbar />
      <Cursor />
    </div>
  );
}

export default App;
