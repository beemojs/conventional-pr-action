# Beemo - TypeScript config

[![Build Status](https://github.com/beemojs/dev/workflows/Build/badge.svg)](https://github.com/beemojs/dev/actions?query=branch%3Amaster)
[![npm version](https://badge.fury.io/js/%40beemo%config-typescript.svg)](https://www.npmjs.com/package/@beemo/config-typescript)
[![npm deps](https://david-dm.org/beemojs/dev.svg?path=packages/config-typescript)](https://www.npmjs.com/package/@beemo/config-typescript)

An official Beemo TypeScript config based on
[tsconfig-beemo](https://www.npmjs.com/package/tsconfig-beemo).

```bash
yarn install --dev typescript @beemo/core @beemo/driver-typescript @beemo/config-typescript
```

> Config will automatically assume project references are being used if a project is using
> workspaces.

## Setup

Create a `configs/typescript.ts` file in your Beemo configuration module that re-exports this config
with your own `include`, `exclude`, etc.

```ts
import config from '@beemo/config-typescript';

export default {
	...config,
	include: ['src/**/*'],
};
```

## Settings

The following Beemo `settings` can be defined and will be enable compiler options.

- `decorators` (`boolean`) - Enable TypeScript decorators. If true, will toggle Babel into loose
  mode. Defaults to `false`.
- `react` (`boolean | classic | automatic`) - Enable React (or React Native) syntax with the defined
  JSX runtime. Defaults to `false`.

```ts
export default {
	module: '<config-module>',
	drivers: ['typescript'],
	settings: {
		react: 'automatic',
	},
};
```
