import dts from 'bun-plugin-dts'

const entries = ['./src/index.ts', './src/providers.ts']

const build = async () => {
	const resultEntries = await Promise.all(
		entries.map((entry) =>
			Bun.build({
				target: 'bun',
				root: './src',
				outdir: './lib',
				splitting: false,
				entrypoints: [entry],
				plugins: [
					dts({
						output: {
							noBanner: true,
							sortNodes: true,
							exportReferencedTypes: false,
							inlineDeclareExternals: true,
						},
						compilationOptions: {
							preferredConfigPath: './tsconfig.json',
						},
					}),
				],
			})
		)
	)

	return { success: resultEntries.every((result) => result.success) }
}

await build()

export { build }
