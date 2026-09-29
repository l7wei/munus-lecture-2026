import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import QRCode from "qrcode";

const posterPath = fileURLToPath(new URL("./poster.html", import.meta.url));
const poster = readFileSync(posterPath, "utf8");
const registrationUrl = poster.match(
  /<a class="registration-action" href="(https:\/\/luma\.com\/[^"]+)"/
)?.[1];
if (!registrationUrl) throw new Error("找不到海報上的 Luma 報名連結");

const svg = (await QRCode.toString(registrationUrl, {
  type: "svg",
  errorCorrectionLevel: "M",
  margin: 4,
  color: { dark: "#000000", light: "#ffffff" }
})).replace("<svg ", '<svg class="registration-qr" role="img" aria-label="報名網址 QR Code" ');

const start = "<!-- QR_CODE_START -->";
const end = "<!-- QR_CODE_END -->";
const first = poster.indexOf(start);
const last = poster.indexOf(end);
if (first < 0 || last < first || poster.indexOf(start, first + 1) !== -1) {
  throw new Error("找不到唯一的 QR Code 區塊");
}
const updated = poster.slice(0, first + start.length) +
  "\n              " + svg + "\n              " +
  poster.slice(last);
writeFileSync(posterPath, updated);
console.log(`QR Code 已更新：${registrationUrl}`);
