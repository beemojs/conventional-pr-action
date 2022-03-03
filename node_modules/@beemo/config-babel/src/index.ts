import type { BabelConfig } from '@beemo/driver-babel';

const { tool } = process.beemo;
const { decorators, esm, react } = tool.config.settings as BeemoSettings;

const config: BabelConfig = {
	babelrc: true,
	babelrcRoots: tool.project.getWorkspaceGlobs({ relative: true }),
	comments: false,
	presets: [
		[
			'beemo',
			{
				decorators,
				modules: esm,
				react,
			},
		],
	],
};

export default config;
