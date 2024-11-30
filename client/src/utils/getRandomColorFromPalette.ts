export function getRandomColorFromPalett() {
  const palette = [
    "#f94144",
    "#f3722c",
    "#f8961e",
    "#f9844a",
    "#f9c74f",
    "#90be6d",
    "#43aa8b",
    "#4d908e",
    "#577590",
    "#277da1",
  ];
  return palette[Math.floor(Math.random() * palette.length)];
}
