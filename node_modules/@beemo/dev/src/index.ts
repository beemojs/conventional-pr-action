import { DriverContext, Path, Tool } from '@beemo/core';

const EXTS = ['.ts', '.tsx'];
const DIRS = ['src', 'tests'];

function hasNoParams(context: DriverContext, name: string): boolean {
	const { params } = context.args;

	return params.length === 0 || (params.length === 1 && params[0] === name);
}

export default function dev(tool: Tool) {
	const usingTypeScript = tool.driverRegistry.isRegistered('typescript');
	const workspacePrefixes = tool.project.getWorkspaceGlobs({ relative: true });

	// Babel
	tool.onRunDriver.listen((context) => {
		context.addOption('--copy-files');

		if (usingTypeScript && !context.getRiskyOption('extensions')) {
			context.addOption('--extensions', EXTS.join(','));
		}

		if (hasNoParams(context, 'babel')) {
			context.addParam(DIRS[0]);
			context.addOption('--out-dir', context.getRiskyOption('esm') ? 'esm' : 'lib');
		}
	}, 'babel');

	// ESLint
	tool.onRunDriver.listen((context) => {
		context.addOptions(['--cache', '--color', '--fix']);

		if (usingTypeScript && !context.getRiskyOption('ext')) {
			context.addOption('--ext', EXTS.join(','));
		}

		if (hasNoParams(context, 'eslint')) {
			if (workspacePrefixes.length > 0) {
				workspacePrefixes.forEach((wsPrefix) => {
					context.addParam(new Path(wsPrefix, `{${DIRS.join(',')}}`).path());
				});
			} else {
				context.addParams(DIRS);
			}
		}

		// Generate prettier config for the prettier rules
		if (tool.driverRegistry.isRegistered('prettier')) {
			context.addDriverDependency(tool.driverRegistry.get('prettier'));
		}

		// Generate typescript config for the typescript rules
		if (usingTypeScript) {
			context.addDriverDependency(tool.driverRegistry.get('typescript'));
		}
	}, 'eslint');

	// Jest
	tool.onRunDriver.listen((context, driver) => {
		context.addOptions(['--colors', '--logHeapUsage']);

		const env: Record<string, string> = {
			NODE_ENV: 'test',
			TZ: 'UTC',
		};

		// https://jestjs.io/docs/ecmascript-modules
		if (tool.config.settings.esm) {
			env.NODE_OPTIONS = `--experimental-vm-modules ${process.env.NODE_OPTIONS ?? ''}`.trim();
		}

		driver.configure({
			env,
		});

		// Generate babel config to transform files
		if (tool.driverRegistry.isRegistered('babel')) {
			context.addDriverDependency(tool.driverRegistry.get('babel'));
		}
	}, 'jest');

	// Prettier
	tool.onRunDriver.listen((context) => {
		if (hasNoParams(context, 'prettier')) {
			context.addOption('--write');
			context.addParam('.');
		}
	}, 'prettier');
}
