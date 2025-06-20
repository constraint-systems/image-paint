import { useAtom } from "jotai";
import { stateRef } from "./consts";
import { ActionModeAtom, CanvasURLAtom, PlaceableImageAtom } from "./Atoms";
import { loadImage } from "./Utils";

export function useMakeCanvasUrl() {
  const [, setCanvasURL] = useAtom(CanvasURLAtom);
  return () => {
    const canvas = stateRef.renderCanvas!;
    if (!canvas) return "";
    const dataUrl = canvas.toDataURL("image/png");
    setCanvasURL(dataUrl);
  };
}

export function useBeginPlacingImage() {
  const [, setPlaceableImage] = useAtom(PlaceableImageAtom);
  const [, setActionMode] = useAtom(ActionModeAtom);

  return async (url: string) => {
    const image = await loadImage(url);
    const maxSize = 1280;
    let width = image.width;
    let height = image.height;
    if (width > maxSize || height > maxSize) {
      const aspectRatio = width / height;
      if (width > height) {
        width = maxSize;
        height = maxSize / aspectRatio;
      } else {
        height = maxSize;
        width = maxSize * aspectRatio;
      }
    }

    setActionMode("place");
    setPlaceableImage({
      url,
      width: width,
      height: height,
      x: stateRef.renderCanvas!.width / 2 - width / 2,
      y: stateRef.renderCanvas!.height / 2 - height / 2,
    });
  };
}
