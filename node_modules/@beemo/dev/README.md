# Beemo - Development configuration module

[![Build Status](https://github.com/beemojs/dev/workflows/Build/badge.svg)](https://github.com/beemojs/dev/actions?query=branch%3Amaster)
[![npm version](https://badge.fury.io/js/%40beemo%config-babel.svg)](https://www.npmjs.com/package/@beemo/config-babel)
[![npm deps](https://david-dm.org/beemojs/dev.svg?path=packages/config-babel)](https://www.npmjs.com/package/@beemo/config-babel)

An official TypeScript-only "batteries included" Beemo
[configuration module](https://beemo.dev/docs/provider) that provides pre-packaged configs for the
Babel, ESLint, Jest, Prettier, and TypeScript drivers and developer tools.

```bash
yarn install --dev @beemo/dev
```

## Requirements

- Files are either `.ts` or `.tsx` (duh).
- Source files are in a folder called `src`.
- Tests files are in a folder called `tests` relative to source, or `__tests__` within source.
- Declaration/types files are in a folder called `types` relative to source.
- Custom TypeScript paths should start with `:` instead of `@` to avoid
  [NPM supply chain attacks](https://github.blog/2021-02-12-avoiding-npm-substitution-attacks/).

## Setup

Create a `.config/beemo.ts` file in the root of your project that configures `@beemo/dev` as the
configuration module. Be sure to enable all drivers and any settings.

```ts
// .config/beemo.ts
export default {
	module: '@beemo/dev',
	drivers: ['babel', 'eslint', 'jest', 'prettier', 'typescript'],
	settings: {},
};
```

### Settings

The following Beemo `settings` can be defined and will be passed to applicable drivers.

- `decorators` (`boolean`) - Enable decorators for Babel and TypeScript drivers. Defaults to
  `false`.
- `esm` (`boolean`) - Enable ECMAScript module "mode" for tools that support it (Babel, Jest, etc).
- `node` (`boolean`) - Current project will target Node.js instead of the browser. Defaults to
  `false`.
- `projects` (`boolean | string[]`) - Enable Jest projects. If `true` is passed, will be resolved
  using workspaces, otherwise requires an array of explicit strings. Defaults to `false`.
- `react` (`boolean | classic | automatic`) - Enable React and JSX support for all drivers. Defaults
  to `false`.

### Overrides

If you would like to override a driver config, create a `.config/beemo/<driver>.ts` file in the root
of the project.
[View the official Beemo docs for more information](https://beemo.dev/docs/consumer#overriding-configs).

```ts
// .config/beemo/eslint.ts
export default {
	rules: {
		'no-param-reassign': 'off',
	},
};
```

## Drivers

The following drivers are directly supported in this configuration module, and automatically passed
common command line options when being ran.

- [Babel](https://www.npmjs.com/package/@beemo/config-babel)
  - Always passes `--copy-files`.
  - Sets `--extensions` to `.ts,.tsx` if using TypeScript.
  - If no out provided, defaults to `src/ --out-dir lib/`.
- [ESLint](https://www.npmjs.com/package/@beemo/config-eslint)
  - Always passes `--cache --color --fix`.
  - Sets `--extensions` to `.ts,.tsx` if using TypeScript.
  - If no target provided, defaults to linting `src/ tests/`.
  - If using workspaces, will target the above in each package.
  - Generates Prettier and TypeScript configs when enabled.
- [Jest](https://www.npmjs.com/package/@beemo/config-jest)
  - Always passes `--colors --logHeapUsage`.
  - Sets `NODE_ENV=test` and `TZ=UTC`.
  - Generates a Babel config when enabled.
  - Supports projects through the `projects` setting.
- [Prettier](https://www.npmjs.com/package/@beemo/config-prettier)
  - If no args provided, defaults to `--write .`.
  - Provides a default ignore list of common files.
- [TypeScript](https://www.npmjs.com/package/@beemo/config-typescript)
  - Modern/next ECMAScript support.
  - Type-checking only.

> Please refer to their documentation for more information on how each one is configured.

## Scaffolds

Once your project has been configured to use Beemo, you can scaffold specific files using our
built-in templates.

### project/dotfiles

Will scaffold common dotfiles like `.gitignore`.

```
beemo scaffold project dotfiles
```

### project/github

Will scaffold GitHub repository workflow files to `.github`. Supports the following workflows:

- `build` - Builds, tests, lints, and type checks the project on each pull request and master merge.
  Also verifies [Packemon](https://packemon.dev) packing and [Docusaurus](https://docusaurus.io)
  building passes.
- `deploy` - Deploys a
  [Docusaurus website](https://docusaurus.io/docs/deployment#deploying-to-github-pages) on each
  master commit. Requires `GH_USER` and `GH_PAGES_DEPLOY` secrets.
- `pr` - Validates a pull request title using the
  [conventional-changelog-beemo](https://github.com/beemojs/conventional-changelog-beemo) preset.

```
beemo scaffold project github
```

### project/package

Will append fields to the root `package.json`.

- Adds `scripts` for common actions like [building](https://packemon.dev), linting, testing, etc.
- When passed `--workspaces`, sets `private` and `workspaces` to `packages/*`.

```
beemo scaffold project package
```

### workspace/package

Will scaffold a new package into a `packages` workspace. Creates `CHANGELOG.md`, `README.md`,
`LICENSE`, and `package.json` files.

```
beemo scaffold workspace package --owner milesj --repo aesthetic framework
```
