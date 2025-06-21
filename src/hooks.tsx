import { useAtom } from "jotai";
import { stateRef } from "./consts";
import { drawToFavicon, loadImage } from "./Utils";
import { CanvasURLAtom } from "./Atoms";

export function usePlaceImage() {
  const [, setCanvasURL] = useAtom(CanvasURLAtom);

  return async function placeImage(url: string) {
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
    setCanvasURL(stateRef.renderCanvas!.toDataURL("image/png"));
    drawToFavicon();
  };
}
