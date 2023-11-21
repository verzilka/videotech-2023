import esbuild from 'esbuild';
import { html } from '@esbuilder/html';

const context = await esbuild.context({
    entryPoints: ['src/index.html'],
    plugins: [
        html({
            serve: true,
        }),
    ],
    outdir: 'www',
    assetNames: '[name]',
});

const {port} = await context.serve({
    servedir: 'www',
    port: 8501,
});

console.log(`Application started at http://127.0.0.1:${port}`);
