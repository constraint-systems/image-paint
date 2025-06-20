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
