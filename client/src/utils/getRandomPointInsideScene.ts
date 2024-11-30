import { Point } from "../geometry/point";
import { getRandomNumberBetween } from "./getRandomNumberBetween";

export function getRandomPointInsideScene({
  sceneWidth,
  sceneHeight,
}: {
  sceneWidth: number;
  sceneHeight: number;
}) {
  return new Point({
    x: getRandomNumberBetween(0, sceneWidth),
    y: getRandomNumberBetween(0, sceneHeight),
  });
}
