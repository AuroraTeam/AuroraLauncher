import { join } from 'path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const toDir = (dir: string) => join(__dirname, dir);

export default defineConfig({
    root: toDir('src/renderer'),
    cacheDir: toDir('node_modules/.vite'),
    base: '',
    build: {
        sourcemap: true,
        outDir: toDir('build/renderer'),
        assetsDir: '.',
        emptyOutDir: true,
    },
    plugins: [react()],
    server: { port: 3000 },
    resolve: {
        alias: [
            {
                find: /@runtime\/(.*)/,
                replacement: toDir('src/renderer/runtime/$1.ts'),
            },
            {
                find: /@scripts\/(.*)/,
                replacement: toDir('src/renderer/scripts/$1.ts'),
            },
        ],
    },
});
