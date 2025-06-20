import { atom } from "jotai";
import { ActionModeType } from "./Types";

export const CameraAtom = atom({
  x: 0,
  y: 0,
  z: 0.5,
});

export const ZoomContainerAtom = atom<HTMLDivElement | null>(null);

export const ActionModeAtom = atom<ActionModeType>("paint");

export const PlaceableImageAtom = atom<{
  url: string;
  width: number;
  height: number;
  x: number;
  y: number;
} | null>(null);

export const CanvasURLAtom = atom<string>("");

export const IsPanningAtom = atom<boolean>(false);
