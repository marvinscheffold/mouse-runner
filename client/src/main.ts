import "./style.css";

let mouseX = 0;
let mouseY = 0;

document.addEventListener("mousemove", updateMousePosition, false);
document.addEventListener("click", updateMousePosition, false);

function updateMousePosition(e: MouseEvent) {
  mouseX = e.pageX;
  mouseY = e.pageY;

  console.log(mouseX, mouseY);
}
