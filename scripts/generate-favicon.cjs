const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

const projectRoot = path.resolve(__dirname, '..');
const source = path.join(projectRoot, 'public', 'favicon.svg');
const icoTarget = path.join(projectRoot, 'public', 'favicon.ico');
const touchTarget = path.join(projectRoot, 'public', 'apple-touch-icon.png');
const sizes = [16, 32, 48, 64, 128, 256];

async function createPng(size) {
  return sharp(source)
    .resize(size, size, { fit: 'contain' })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();
}

async function main() {
  const images = await Promise.all(sizes.map(createPng));
  const directory = Buffer.alloc(6 + images.length * 16);

  directory.writeUInt16LE(0, 0);
  directory.writeUInt16LE(1, 2);
  directory.writeUInt16LE(images.length, 4);

  let offset = directory.length;
  images.forEach((image, index) => {
    const size = sizes[index];
    const entry = 6 + index * 16;

    directory.writeUInt8(size === 256 ? 0 : size, entry);
    directory.writeUInt8(size === 256 ? 0 : size, entry + 1);
    directory.writeUInt8(0, entry + 2);
    directory.writeUInt8(0, entry + 3);
    directory.writeUInt16LE(1, entry + 4);
    directory.writeUInt16LE(32, entry + 6);
    directory.writeUInt32LE(image.length, entry + 8);
    directory.writeUInt32LE(offset, entry + 12);
    offset += image.length;
  });

  fs.writeFileSync(icoTarget, Buffer.concat([directory, ...images]));
  await sharp(source)
    .resize(180, 180, { fit: 'contain' })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toFile(touchTarget);

  console.log(`Generated ${path.relative(projectRoot, icoTarget)} with ${sizes.length} sizes.`);
  console.log(`Generated ${path.relative(projectRoot, touchTarget)} at 180×180.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
