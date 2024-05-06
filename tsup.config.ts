import { defineConfig } from 'tsup'

const buildConfig = defineConfig({
	outDir: 'lib',
	platform: 'node',
	format: ['cjs', 'esm'],
	entry: ['src/index.ts', 'src/providers.ts'],
	dts: true,
	clean: true,
	minify: true,
	bundle: true,
	keepNames: true,
	sourcemap: false,
	minifyWhitespace: true,
})

export default buildConfig
