import { esbuildDecorators } from '@aurora-launcher/esbuild-decorators';
import { context } from 'esbuild';
import minimist from 'minimist';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { _, watch, ...args } = minimist(process.argv.slice(2));

console.log('Build...');
console.time('Build successfully');

const ctx = await context({
    entryPoints: ['src/main/index.ts'],
    bundle: true,
    platform: 'node',
    format: 'cjs',
    outdir: 'build/main',
    external: ['electron'],
    loader: {
        '.png': 'file',
    },
    plugins: [esbuildDecorators()],
    ...args,
}).catch(() => process.exit(1));
console.timeEnd('Build successfully');

if (watch) {
    console.log('Watching...');
    await ctx.watch();
} else {
    ctx.dispose();
}
