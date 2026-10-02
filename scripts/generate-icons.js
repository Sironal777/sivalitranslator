import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Minimal standalone PNG encoder using Node standard library
function createSolidPng(width, height, r, g, b, a = 255) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth: 8
  ihdr[9] = 6; // Color type: RGBA
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace

  // Raw image data with scanline filters
  const scanlineWidth = width * 4 + 1; // 1 filter byte per line
  const rawData = Buffer.alloc(scanlineWidth * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineWidth;
    rawData[rowOffset] = 0; // Filter type 0 (None)
    
    // Radial gradient effect from center (w/2, h/2)
    const cy = y - height * 0.45;
    for (let x = 0; x < width; x++) {
      const cx = x - width * 0.5;
      const dist = Math.sqrt(cx * cx + cy * cy) / (Math.max(width, height) * 0.5);
      const pxOffset = rowOffset + 1 + x * 4;

      // Deep glass jewel gradient: Cyan #0284c7 to Indigo #312e81 to Dark #07090e
      const factor = Math.min(1, Math.max(0, dist));
      const curR = Math.round(15 * factor + (r * (1 - factor * 0.7)));
      const curG = Math.round(23 * factor + (g * (1 - factor * 0.7)));
      const curB = Math.round(42 * factor + (b * (1 - factor * 0.6)));

      rawData[pxOffset] = Math.min(255, curR);
      rawData[pxOffset + 1] = Math.min(255, curG);
      rawData[pxOffset + 2] = Math.min(255, curB);
      rawData[pxOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);

  // Helper to build PNG chunks with CRC32
  function makeChunk(type, data) {
    const typeBuf = Buffer.from(type, 'ascii');
    const lenBuf = Buffer.alloc(4);
    lenBuf.writeUInt32BE(data.length, 0);

    const crcBuf = Buffer.alloc(4);
    const combined = Buffer.concat([typeBuf, data]);
    const crc = crc32(combined);
    crcBuf.writeUInt32BE(crc, 0);

    return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
  }

  // Precomputed CRC32 table
  function crc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xff];
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c >>> 0;
  }

  const ihdrChunk = makeChunk('IHDR', ihdr);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const outDir = path.resolve('public');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Generate jewel cyan-indigo icons
const icon192 = createSolidPng(192, 192, 56, 189, 248);
const icon512 = createSolidPng(512, 512, 56, 189, 248);
const iconApple = createSolidPng(180, 180, 56, 189, 248);
const iconMaskable = createSolidPng(512, 512, 99, 102, 241);

fs.writeFileSync(path.join(outDir, 'pwa-192x192.png'), icon192);
fs.writeFileSync(path.join(outDir, 'pwa-512x512.png'), icon512);
fs.writeFileSync(path.join(outDir, 'apple-touch-icon.png'), iconApple);
fs.writeFileSync(path.join(outDir, 'pwa-maskable-512x512.png'), iconMaskable);

console.log('Generated PNG icons in public/');
