# Munus Shih lecture

Standalone lecture site and poster for **設計作為認識世界的方法**, presented by 文創設計小組.

- [Lecture website](https://l7wei.github.io/munus-lecture-2026/) ([source](index.html))
- [Poster preview](poster.html) · [Print-ready PNG (2160 × 2700)](poster.png)
- [Registration](https://luma.com/szfyxfyh)

Open `index.html` or `poster.html` directly in a browser to preview them. The organizer logo is embedded in both pages; the poster's registration QR code is inline. The supplied `design-group-mark.svg` is included as a separate design asset. Google Fonts are requested when online, with system-font fallbacks.

To regenerate the QR code and PNG, run `npm ci`, `npm run qr`, then `npm run export`. The export writes `poster.png` in the repository root and requires Playwright's Chromium browser (`npx playwright install chromium` if it is not installed).

Source: the supplied Munus Shih lecture website, poster, design asset, and export scripts. No license is granted by this repository.
