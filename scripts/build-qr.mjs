import { build } from 'esbuild';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

await build({
  entryPoints: [resolve(rootDir, 'src/qr-connect.js')],
  outfile: resolve(rootDir, 'assets/wb-qr-connect.js'),
  bundle: true,
  minify: true,
  format: 'iife',
  platform: 'browser',
  target: ['es2018'],
  loader: {
    '.png': 'dataurl',
  },
});

console.log('Built assets/wb-qr-connect.js cleanly');
