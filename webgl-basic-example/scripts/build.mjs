import esbuild from 'esbuild';

await esbuild.build({
    entryPoints: ['src/main.ts'],
    bundle: true,
    outfile: 'dist/main.js'
});
