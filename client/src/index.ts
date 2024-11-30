import { Game } from "./game";
import "./style.css";

function index() {
  const game = new Game();
  document.addEventListener("mousedown", () => {
    game.start();
  });
}
index();
