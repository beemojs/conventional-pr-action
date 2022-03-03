# Beemo - Babel config

[![Build Status](https://github.com/beemojs/dev/workflows/Build/badge.svg)](https://github.com/beemojs/dev/actions?query=branch%3Amaster)
[![npm version](https://badge.fury.io/js/%40beemo%config-babel.svg)](https://www.npmjs.com/package/@beemo/config-babel)
[![npm deps](https://david-dm.org/beemojs/dev.svg?path=packages/config-babel)](https://www.npmjs.com/package/@beemo/config-babel)

An official Beemo Babel config based on
[babel-preset-beemo](https://www.npmjs.com/package/babel-preset-beemo).

```bash
yarn install --dev @babel/core @beemo/core @beemo/driver-babel @beemo/config-babel
```

## Setup

Create a `configs/babel.ts` file in your Beemo configuration module that re-exports this config.

```ts
export { default } from '@beemo/config-babel';
```

## Settings

The following Beemo `settings` can be defined and will be passed to the preset.

- `decorators` (`boolean`) - Enable TypeScript decorators. If true, will toggle Babel into loose
  mode. Defaults to `false`.
- `react` (`boolean | classic | automatic`) - Enable the React plugin and the defined JSX runtime.
  Defaults to `false`.

```ts
export default {
	module: '<config-module>',
	drivers: ['babel'],
	settings: {
		react: 'automatic',
	},
};
```
