import { existsSync, statSync } from 'node:fs';
import { extname, resolve } from 'node:path';

const input = process.argv[2] || 'public/marketing/mtm-test.mp4';
const file = resolve(process.cwd(), input);

if (!existsSync(file)) {
  console.error(`Missing marketing video: ${input}`);
  console.error('Copy your generated MP4 into public/marketing/mtm-test.mp4 and run this command again.');
  process.exit(1);
}

if (extname(file).toLowerCase() !== '.mp4') {
  console.error('Expected an .mp4 file for the first Postiz test.');
  process.exit(1);
}

const size = statSync(file).size;
if (size === 0) {
  console.error('Video file is empty.');
  process.exit(1);
}

const mb = size / 1024 / 1024;
console.log(`Marketing video OK: ${input}`);
console.log(`Size: ${mb.toFixed(2)} MB`);
console.log('Expected production URL: https://www.memoriestomelody.com/marketing/' + input.split('/').pop());
console.log('After deployment, verify with:');
console.log('curl -I "https://www.memoriestomelody.com/marketing/' + input.split('/').pop() + '"');
