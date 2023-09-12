import { esbuildDecorators } from '@aurora-launcher/esbuild-decorators';
import { context } from 'esbuild';
import minimist from 'minimist';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { _, watch, ...args } = minimist(process.argv.slice(2));

if (!watch) {
    console.log('Build...');
    console.time('Build successfully');
}

const ctx = await context({
    entryPoints: ['src/main/index.ts'],
    bundle: true,
    sourcemap: true,
    platform: 'node',
    target: 'node20',
    format: 'cjs',
    outdir: 'build/main',
    external: ['electron'],
    keepNames: true,
    loader: {
        '.png': 'file',
    },
    plugins: [esbuildDecorators()],
    ...args,
}).catch(() => process.exit(1));

if (watch) {
    console.log('Watching...');
    await ctx.watch();
} else {
    await ctx.rebuild();
    await ctx.dispose();
    console.timeEnd('Build successfully');
}
