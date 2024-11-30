import { Point } from "../geometry/point";
import { getRandomNumberBetween } from "./getRandomNumberBetween";

export function getRandomPointOutsideScene({
  sceneWidth,
  sceneHeight,
  objectWidth,
  objectHeight,
}: {
  sceneWidth: number;
  sceneHeight: number;
  objectWidth: number;
  objectHeight: number;
}) {
  const randomSide = Math.floor(Math.random() * 4);
  switch (randomSide) {
    case 0:
      return new Point({
        x: getRandomNumberBetween(0, sceneWidth),
        y: -objectHeight,
      });
    case 1:
      return new Point({
        x: sceneWidth + objectWidth,
        y: getRandomNumberBetween(0, sceneHeight),
      });
    case 2:
      return new Point({
        x: getRandomNumberBetween(0, sceneWidth),
        y: sceneHeight + objectHeight,
      });
    case 3:
      return new Point({
        x: -objectWidth,
        y: getRandomNumberBetween(0, sceneHeight),
      });
    default:
      throw new Error("Invalid randomSide");
  }
}
