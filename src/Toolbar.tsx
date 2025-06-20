import { useAtom } from "jotai";
import { ActionModeAtom, PlaceableImageAtom } from "./Atoms";
import { ActionModeType } from "./Types";
import { stateRef } from "./consts";
import { loadImage } from "./Utils";
import { useEffect, useState } from "react";
import { useBeginPlacingImage } from "./hooks";

export function Toolbar() {
  const [actionMode, setActionMode] = useAtom(ActionModeAtom);
  const [placeableImage, setPlaceableImage] = useAtom(PlaceableImageAtom);
  const [showInfo, setShowInfo] = useState(false);
  const beginPlacingImage = useBeginPlacingImage();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowInfo(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <>
      <div className="absolute pointer-events-none select-none top-4 left-4 flex flex-col gap-2">
        Image Paint
      </div>
      <div className="absolute pointer-events-none select-none top-6 right-2 flex flex-col gap-2">
        <button
          key="about"
          className={`px-4 py-3 rounded-[50%] pointer-events-auto bg-neutral-800 hover:bg-yellow-500 hover:text-black rotate-45`}
          onClick={() => setShowInfo(!showInfo)}
        >
          About
        </button>
      </div>
      <div className="absolute pointer-events-none select-none bottom-4 left-4 flex flex-col gap-2">
        {actionMode === "place" ? null : (
          <>
            {["paint", "erase"].map((mode) => (
              <button
                key={mode}
                className={`px-4 py-3 rounded-[50%] pointer-events-auto ${actionMode === mode ? "bg-neutral-300 text-black" : "bg-neutral-800 hover:bg-neutral-500"} `}
                onClick={() => setActionMode(mode as ActionModeType)}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
            <label
              key="image-upload"
              className={`block px-4 py-3 pointer-events-auto rounded-[50%] hover:bg-blue-500 bg-neutral-800`}
            >
              <input
                type="file"
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  setActionMode("place");
                  if (file) {
                    const url = URL.createObjectURL(file);
                    beginPlacingImage(url);
                  }
                }}
              />
              +Image
            </label>
          </>
        )}
      </div>
      <div className="absolute pointer-events-none bottom-4 right-4 select-none flex gap-2">
        {actionMode === "place" ? (
          <>
            <button
              key="image-place-clear"
              className={`px-4 py-3 pointer-events-auto rounded-[50%] hover:bg-red-600 bg-neutral-800`}
              onClick={() => {
                stateRef.rtx?.clearRect(
                  0,
                  0,
                  stateRef.renderCanvas!.width,
                  stateRef.renderCanvas!.height,
                );
              }}
            >
              Clear
            </button>

            <button
              key="cancel"
              className={`px-4 py-3 pointer-events-auto rounded-[50%] hover:bg-red-600 bg-neutral-800`}
              onClick={async () => {
                setPlaceableImage(null);
                setActionMode("paint");
              }}
            >
              Cancel
            </button>
            <button
              key="place-image"
              className={`px-4 py-3 pointer-events-auto rounded-[50%] hover:bg-green-700 bg-neutral-800`}
              onClick={async () => {
                if (placeableImage) {
                  const image = await loadImage(placeableImage.url);
                  stateRef.rtx!.drawImage(
                    image,
                    placeableImage.x,
                    placeableImage.y,
                    placeableImage.width,
                    placeableImage.height,
                  );
                  setPlaceableImage(null);
                  setActionMode("paint");
                }
              }}
            >
              Place Image
            </button>
          </>
        ) : (
          <>
            <button
              key="clear"
              className={`px-4 py-3 pointer-events-auto rounded-[50%] hover:bg-red-600 bg-neutral-800`}
              onClick={() => {
                stateRef.rtx?.clearRect(
                  0,
                  0,
                  stateRef.renderCanvas!.width,
                  stateRef.renderCanvas!.height,
                );
              }}
            >
              Clear
            </button>
            <button
              key="download"
              className={`px-4 py-3 pointer-events-auto rounded-[50%] hover:bg-green-700 bg-neutral-800`}
              onClick={() => {
                const link = document.createElement("a");
                const timestamp = new Date()
                  .toISOString()
                  .replace(/[:.]/g, "-");
                link.download = "image-paint-" + timestamp + ".png";
                link.href = stateRef.renderCanvas!.toDataURL("image/png");
                link.click();
              }}
            >
              Download
            </button>
          </>
        )}
      </div>
      {showInfo ? (
        <div
          className="absolute inset-0 pointer-events-none flex items-center justify-center"
          onClick={() => setShowInfo(true)}
        >
          <div
            className="bg-neutral-800 pointer-events-auto max-w-[540px] w-full px-4 pt-4 pb-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-2">
              <div className="text-yellow-500">About</div>
              <button
                key="close-info"
                className="bg-neutral-700 rounded-[50%] hover:bg-yellow-500 hover:text-black pointer-events-auto px-4 py-3 rotate-45 -mr-4"
                onClick={() => setShowInfo(false)}
              >
                Close
              </button>
            </div>
            <div className="mb-[1lh]">
              A paint effect based on how computers render images. Pixels are
              copied and pasted in the direction you click and drag.
            </div>

            <div className="">
              This is an attempt to make something that feels tactile like
              paint, but that "goes with the grain" of its digital nature.
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
