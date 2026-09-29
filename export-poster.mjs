import { chromium } from "playwright";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";

const source = new URL("./poster.html", import.meta.url);
source.searchParams.set("export", "1");
const output = resolve(process.argv[2] ?? "poster.png");
const browser = await chromium.launch();

try {
  const page = await browser.newPage({
    viewport: { width: 1080, height: 1350 },
    deviceScaleFactor: 2
  });
  const pageErrors = [];
  page.on("pageerror", error => pageErrors.push(error.message));
  await page.goto(source.href, { waitUntil: "load" });
  await page.waitForFunction(() =>
    document.getElementById("poster")?.dataset.artReady === "true"
  );
  const fontStatus = await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      [...document.querySelectorAll("#poster img")].map(image => image.decode())
    );
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    return [...document.fonts].some(face =>
      face.family.includes("Noto Sans TC") && face.status === "loaded"
    );
  });
  if (!fontStatus) {
    console.warn("Noto Sans TC 未載入：本次匯出使用系統繁體中文字體。");
  }
  const poster = page.locator("#poster");
  const problems = await poster.evaluate(element => {
    const bounds = element.getBoundingClientRect();
    const issues = [];
    if (bounds.width !== 1080 || bounds.height !== 1350) {
      issues.push(`畫布尺寸錯誤：${bounds.width} × ${bounds.height}`);
    }
    for (const node of element.querySelectorAll("p, h1 span, h2 span, .registration strong")) {
      const range = document.createRange();
      range.selectNodeContents(node);
      const rect = range.getBoundingClientRect();
      if (rect.left < bounds.left + 64 || rect.right > bounds.right - 64 ||
          rect.top < bounds.top + 64 || rect.bottom > bounds.bottom - 64) {
        issues.push(`文字超出安全邊界：${node.textContent}`);
      }
      if (node.scrollWidth > node.clientWidth + 1) {
        issues.push(`文字水平溢出：${node.textContent}`);
      }
    }
    return issues;
  });
  if (pageErrors.length || problems.length) {
    throw new Error([...pageErrors, ...problems].join("\n"));
  }
  const image = await poster.screenshot({
    path: output,
    type: "png",
    scale: "device",
    omitBackground: false,
    animations: "disabled"
  });
  const width = image.readUInt32BE(16);
  const height = image.readUInt32BE(20);
  if (width !== 2160 || height !== 2700) {
    throw new Error(`PNG 尺寸錯誤：${width} × ${height}`);
  }
  console.log(`已匯出 ${output} (${width} × ${height})`);
  console.log(`來源：${fileURLToPath(source)}`);
} finally {
  await browser.close();
}
