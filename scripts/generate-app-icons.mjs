/**
 * Build iOS and Android launcher icons from the approved 1024 source.
 *
 * The source artwork is not redrawn. iOS and the Play listing use it
 * full-bleed and opaque. The Android adaptive foreground is scaled so the
 * neon wordmark stays inside the 66dp safe circle on the 108dp canvas.
 *
 * Run: node scripts/generate-app-icons.mjs
 * Requires the `sharp` package (npm install --no-save sharp).
 */
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = join(root, "resources/app-icon-source-1024.png");

const BACKGROUND = { r: 0x08, g: 0x08, b: 0x0a, alpha: 1 };

/**
 * Artwork width divided by the adaptive canvas.
 * The safe zone is the centered circle with diameter 66/108 of the canvas.
 * Filling that circle's bounding square (66/108) clips this full-bleed
 * wordmark. 0.49 keeps every neon pixel inside the circle at every density;
 * 0.50 still leaves a few glow pixels outside at xxhdpi and xxxhdpi.
 */
const ADAPTIVE_ARTWORK_SCALE = 0.49;

/**
 * Legacy round icons are masked to a circle the size of the whole image,
 * which is larger than the adaptive safe circle. 0.75 fills that circle
 * without pushing the wordmark outside it.
 */
const ROUND_ARTWORK_SCALE = 0.75;

const LEGACY_SIZES = {
  mdpi: 48,
  hdpi: 72,
  xhdpi: 96,
  xxhdpi: 144,
  xxxhdpi: 192,
};

const ADAPTIVE_SIZES = {
  mdpi: 108,
  hdpi: 162,
  xhdpi: 216,
  xxhdpi: 324,
  xxxhdpi: 432,
};

const iosDir = join(root, "ios/App/App/Assets.xcassets/AppIcon.appiconset");
const resDir = join(root, "android/app/src/main/res");

function pngInfo(bytes) {
  const signature = bytes.subarray(0, 8).toString("hex");
  if (signature !== "89504e470d0a1a0a") {
    throw new Error("Not a PNG");
  }
  const chunk = bytes.subarray(12, 16).toString("ascii");
  if (chunk !== "IHDR") {
    throw new Error("PNG IHDR is not the first chunk");
  }
  return {
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
    depth: bytes[24],
    colorType: bytes[25],
    interlace: bytes[28],
  };
}

async function assertPng(path, expected) {
  const bytes = await readFile(path);
  const info = pngInfo(bytes);
  if (info.width !== expected.width || info.height !== expected.height) {
    throw new Error(`${path} is ${info.width}x${info.height}, expected ${expected.width}x${expected.height}`);
  }
  if (info.depth !== 8 || info.interlace !== 0) {
    throw new Error(`${path} must be 8-bit and non-interlaced`);
  }
  if (info.colorType !== expected.colorType) {
    throw new Error(`${path} color type ${info.colorType}, expected ${expected.colorType}`);
  }
  return bytes;
}

function luminance(r, g, b) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function saturation(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max === 0 ? 0 : (max - min) / max;
}

function assertNeonInsideCircle(data, size, channels, radius) {
  const cx = (size - 1) / 2;
  const cy = (size - 1) / 2;
  let neon = 0;
  let outside = 0;
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const i = (y * size + x) * channels;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const alpha = channels === 4 ? data[i + 3] : 255;
      if (alpha < 16) continue;
      if (luminance(r, g, b) > 80 && saturation(r, g, b) > 0.25) {
        neon += 1;
        const distance = Math.hypot(x - cx, y - cy);
        if (distance > radius + 1.5) outside += 1;
      }
    }
  }
  if (neon === 0) {
    throw new Error("No neon pixels found while checking the safe zone");
  }
  if (outside > 0) {
    throw new Error(`${outside} neon pixels sit outside the safe circle (radius ${radius.toFixed(1)})`);
  }
}

async function resizedArtwork(size) {
  return sharp(sourcePath)
    .resize(size, size, { fit: "fill", kernel: "lanczos3" })
    .removeAlpha()
    .png()
    .toBuffer();
}

async function centeredArtwork(canvasSize, artworkSize, background) {
  const artwork = await resizedArtwork(artworkSize);
  const left = Math.floor((canvasSize - artworkSize) / 2);
  const top = Math.floor((canvasSize - artworkSize) / 2);
  return sharp({
    create: {
      width: canvasSize,
      height: canvasSize,
      channels: 4,
      background,
    },
  })
    .composite([{ input: artwork, left, top }])
    .png()
    .toBuffer();
}

async function writeOpaqueSquare(canvasSize, dest) {
  const artworkSize = canvasSize;
  const buffer = await centeredArtwork(canvasSize, artworkSize, BACKGROUND);
  await sharp(buffer).flatten({ background: BACKGROUND }).removeAlpha().png({ compressionLevel: 9 }).toFile(dest);
}

async function writeAdaptiveForeground(canvasSize, dest) {
  const artworkSize = Math.round(canvasSize * ADAPTIVE_ARTWORK_SCALE);
  const buffer = await centeredArtwork(canvasSize, artworkSize, { r: 0, g: 0, b: 0, alpha: 0 });
  await sharp(buffer).png({ compressionLevel: 9 }).toFile(dest);

  const { data, info } = await sharp(buffer).raw().toBuffer({ resolveWithObject: true });
  const radius = (canvasSize * (66 / 108)) / 2;
  assertNeonInsideCircle(data, info.width, info.channels, radius);
}

async function writeAdaptiveBackground(canvasSize, dest) {
  await sharp({
    create: {
      width: canvasSize,
      height: canvasSize,
      channels: 3,
      background: BACKGROUND,
    },
  })
    .png({ compressionLevel: 9 })
    .toFile(dest);
}

async function writeRoundIcon(canvasSize, dest) {
  const artworkSize = Math.round(canvasSize * ROUND_ARTWORK_SCALE);
  const composed = await centeredArtwork(canvasSize, artworkSize, BACKGROUND);
  const mask = Buffer.from(
    `<svg width="${canvasSize}" height="${canvasSize}" xmlns="http://www.w3.org/2000/svg"><circle cx="${canvasSize / 2}" cy="${canvasSize / 2}" r="${canvasSize / 2}" fill="#fff"/></svg>`,
  );
  const masked = await sharp(composed).composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
  await sharp(masked).png({ compressionLevel: 9 }).toFile(dest);

  const { data, info } = await sharp(composed).raw().toBuffer({ resolveWithObject: true });
  assertNeonInsideCircle(data, info.width, info.channels, canvasSize / 2);
}

async function writeIosIcon() {
  const { data, info } = await sharp(sourcePath).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  if (info.width !== 1024 || info.height !== 1024 || info.channels !== 3) {
    throw new Error(`Source must be an opaque 1024x1024 RGB PNG, got ${info.width}x${info.height} channels=${info.channels}`);
  }
  const encoded = await sharp(data, {
    raw: { width: 1024, height: 1024, channels: 3 },
  })
    .png({ compressionLevel: 9 })
    .toBuffer();

  const roundTrip = await sharp(encoded).raw().toBuffer();
  if (!roundTrip.equals(data)) {
    throw new Error("iOS icon pixels differ from the approved source");
  }

  const universal = join(iosDir, "AppIcon-512@2x.png");
  await writeFile(universal, encoded);
  await copyFile(universal, join(iosDir, "AppIcon-dark.png"));
  await copyFile(universal, join(iosDir, "AppIcon-tinted.png"));

  for (const name of ["AppIcon-512@2x.png", "AppIcon-dark.png", "AppIcon-tinted.png"]) {
    await assertPng(join(iosDir, name), { width: 1024, height: 1024, colorType: 2 });
  }
}

async function writeAndroidIcons() {
  for (const [density, size] of Object.entries(LEGACY_SIZES)) {
    const dir = join(resDir, `mipmap-${density}`);
    await mkdir(dir, { recursive: true });
    const launcher = join(dir, "ic_launcher.png");
    await writeOpaqueSquare(size, launcher);
    await assertPng(launcher, { width: size, height: size, colorType: 2 });

    const round = join(dir, "ic_launcher_round.png");
    await writeRoundIcon(size, round);
    await assertPng(round, { width: size, height: size, colorType: 6 });
  }

  for (const [density, size] of Object.entries(ADAPTIVE_SIZES)) {
    const dir = join(resDir, `mipmap-${density}`);
    await mkdir(dir, { recursive: true });
    const foreground = join(dir, "ic_launcher_foreground.png");
    const background = join(dir, "ic_launcher_background.png");
    await writeAdaptiveForeground(size, foreground);
    await writeAdaptiveBackground(size, background);
    await assertPng(foreground, { width: size, height: size, colorType: 6 });
    await assertPng(background, { width: size, height: size, colorType: 2 });

    const backgroundPixels = await sharp(background).raw().toBuffer();
    for (let i = 0; i < backgroundPixels.length; i += 3) {
      if (
        backgroundPixels[i] !== BACKGROUND.r ||
        backgroundPixels[i + 1] !== BACKGROUND.g ||
        backgroundPixels[i + 2] !== BACKGROUND.b
      ) {
        throw new Error(`${background} is not solid #08080a`);
      }
    }
  }
}

async function writeStoreAndWebIcons() {
  const playStore = join(root, "resources/play-store-icon-512.png");
  await writeOpaqueSquare(512, playStore);
  await assertPng(playStore, { width: 512, height: 512, colorType: 2 });

  const appleTouch = join(root, "public/apple-touch-icon.png");
  await writeOpaqueSquare(180, appleTouch);
  await assertPng(appleTouch, { width: 180, height: 180, colorType: 2 });

  const favicon = join(root, "public/favicon-32.png");
  await writeOpaqueSquare(32, favicon);
  await assertPng(favicon, { width: 32, height: 32, colorType: 2 });
}

function adaptiveXml() {
  return `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@mipmap/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
`;
}

async function writeAndroidXml() {
  const xml = adaptiveXml();
  await writeFile(join(resDir, "mipmap-anydpi-v26/ic_launcher.xml"), xml);
  await writeFile(join(resDir, "mipmap-anydpi-v26/ic_launcher_round.xml"), xml);
  await writeFile(
    join(resDir, "values/ic_launcher_background.xml"),
    `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#08080a</color>
</resources>
`,
  );
}

await writeIosIcon();
await writeAndroidIcons();
await writeStoreAndWebIcons();
await writeAndroidXml();

const contents = JSON.parse(await readFile(join(iosDir, "Contents.json"), "utf8"));
if (contents.images.length !== 3) {
  throw new Error("AppIcon Contents.json must keep the three universal 1024 slots");
}

console.log("App icons written from resources/app-icon-source-1024.png");
