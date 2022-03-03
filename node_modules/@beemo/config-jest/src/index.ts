import type { JestConfig } from '@beemo/driver-jest';

const { tool } = process.beemo;
const { esm, projects, react } = tool.config.settings as BeemoSettings;

const config: JestConfig = {
	preset: 'jest-preset-beemo',
	extensionsToTreatAsEsm: esm ? ['.ts', '.tsx'] : [],
	testEnvironment: react ? 'jsdom' : 'node',
};

if (tool.package.workspaces && projects) {
	config.projects = tool.project
		.getWorkspaceGlobs({ relative: true })
		.map((wsPath) => `<rootDir>/${wsPath}`);
}

export default config;
