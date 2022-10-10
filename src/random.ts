export function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomMonth() {
  return Math.random() < 0.5 ? "04" : "10"; // april or october
}

export function randomYear() {
  return randomInt(1971, new Date().getFullYear());
}
