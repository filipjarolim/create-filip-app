#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const root = path.join(__dirname, '..');
const images = path.join(root, 'assets', 'images');
const source = path.join(images, 'mark.svg');

function crc32(buffer) {
  let crc = ~0;
  for (const byte of buffer) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return ~crc >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const name = Buffer.from(type);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([name, data])));
  return Buffer.concat([length, name, data, crc]);
}

function png(size, paint) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y += 1) {
    const row = y * (size * 4 + 1);
    raw[row] = 0;
    for (let x = 0; x < size; x += 1) {
      const [r, g, b, a] = paint(x, y, size);
      const index = row + 1 + x * 4;
      raw[index] = r;
      raw[index + 1] = g;
      raw[index + 2] = b;
      raw[index + 3] = a;
    }
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8;
  header[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', header),
    chunk('IDAT', zlib.deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function parseColor(svg) {
  const match = svg.match(/fill="#([0-9a-fA-F]{6})"/);
  if (!match) return [79, 70, 229];
  const value = match[1];
  return [parseInt(value.slice(0, 2), 16), parseInt(value.slice(2, 4), 16), parseInt(value.slice(4, 6), 16)];
}

function insideRoundedRect(x, y, size, radius) {
  const inset = radius;
  if (x >= inset && x < size - inset) return y >= 0 && y < size;
  if (y >= inset && y < size - inset) return x >= 0 && x < size;
  const corners = [
    [inset, inset],
    [size - inset - 1, inset],
    [inset, size - inset - 1],
    [size - inset - 1, size - inset - 1],
  ];
  return corners.some(([cx, cy]) => (x - cx) ** 2 + (y - cy) ** 2 <= radius ** 2);
}

function icon(size, background, glyph, transparentOutside) {
  const radius = Math.round(size * 0.22);
  return png(size, (x, y) => {
    if (!insideRoundedRect(x, y, size, radius)) {
      return transparentOutside ? [0, 0, 0, 0] : background;
    }
    const dx = x - size / 2;
    const dy = y - size / 2;
    return dx * dx + dy * dy < (size * 0.22) ** 2 ? [...glyph, 255] : [...background, 255];
  });
}

const svg = fs.existsSync(source)
  ? fs.readFileSync(source, 'utf8')
  : '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><rect width="1024" height="1024" rx="224" fill="#4F46E5"/><circle cx="512" cy="512" r="220" fill="#FFFFFF"/></svg>';
fs.mkdirSync(images, { recursive: true });
fs.writeFileSync(source, svg);
const brand = parseColor(svg);
const white = [255, 255, 255];
const dark = brand.map((channel) => Math.round(channel * 0.35));

function glyphOnly(size, color) {
  return png(size, (x, y) => {
    const dx = x - size / 2;
    const dy = y - size / 2;
    return dx * dx + dy * dy < (size * 0.22) ** 2 ? [...color, 255] : [0, 0, 0, 0];
  });
}

const files = {
  'icon.png': icon(1024, brand, white, false),
  'icon-dark.png': icon(1024, dark, white, false),
  'icon-tinted.png': glyphOnly(1024, white),
  'icon-premium.png': icon(1024, [15, 23, 42], [165, 180, 252], false),
  'android-icon-foreground.png': glyphOnly(1024, white),
  'android-icon-background.png': png(1024, () => [...brand, 255]),
  'android-icon-monochrome.png': glyphOnly(1024, white),
  'splash-icon.png': glyphOnly(512, white),
  'favicon.png': icon(48, brand, white, false),
};

Object.entries(files).forEach(([name, contents]) => {
  fs.writeFileSync(path.join(images, name), contents);
  console.log(name);
});
