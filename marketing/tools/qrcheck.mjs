import jsQR from "jsqr"; import { PNG } from "pngjs"; import { readFileSync } from "node:fs";
for (const f of process.argv.slice(2)) {
  const png = PNG.sync.read(readFileSync(f));
  const r = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
  console.log(f.split("/").pop(), "->", r?.data ?? "NOT READABLE");
}
