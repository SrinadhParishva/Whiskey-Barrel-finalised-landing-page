import { resolve } from 'path';
import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        category: resolve(__dirname, 'category.html'),
        experience: resolve(__dirname, 'experience.html'),
        product: resolve(__dirname, 'product.html'),
        visit: resolve(__dirname, 'visit.html'),
        connect: resolve(__dirname, 'connect/index.html'),
      },
    },
  },
  plugins: [
    {
      name: 'copy-static-site-assets',
      closeBundle() {
        const dist = resolve(__dirname, 'dist');
        if (!fs.existsSync(dist)) return;

        // Copy root scripts and metadata to dist
        const rootFilesToCopy = [
          'script.js',
          'robots.txt',
          'sitemap.xml',
          'llms.txt',
          'llms-full.txt',
          'favicon.ico',
          'favicon.png',
          '_headers',
          '_redirects'
        ];

        for (const file of rootFilesToCopy) {
          const srcPath = resolve(__dirname, file);
          const destPath = resolve(dist, file);
          if (fs.existsSync(srcPath) && !fs.existsSync(destPath)) {
            fs.copyFileSync(srcPath, destPath);
          }
        }

        // Ensure assets folder in dist contains all original assets
        const assetsSrc = resolve(__dirname, 'assets');
        const assetsDest = resolve(dist, 'assets');
        if (fs.existsSync(assetsSrc)) {
          if (!fs.existsSync(assetsDest)) fs.mkdirSync(assetsDest, { recursive: true });
          const items = fs.readdirSync(assetsSrc);
          for (const item of items) {
            const srcPath = path.join(assetsSrc, item);
            const destPath = path.join(assetsDest, item);
            if (!fs.existsSync(destPath) && fs.statSync(srcPath).isFile()) {
              fs.copyFileSync(srcPath, destPath);
            }
          }
        }

        // Copy experience folder to dist/experience
        const expSrc = resolve(__dirname, 'experience');
        const expDest = resolve(dist, 'experience');
        if (fs.existsSync(expSrc)) {
          fs.cpSync(expSrc, expDest, { recursive: true });
        }
      }
    }
  ]
});
