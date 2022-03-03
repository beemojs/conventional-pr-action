# Beemo - ESLint config

[![Build Status](https://github.com/beemojs/dev/workflows/Build/badge.svg)](https://github.com/beemojs/dev/actions?query=branch%3Amaster)
[![npm version](https://badge.fury.io/js/%40beemo%config-eslint.svg)](https://www.npmjs.com/package/@beemo/config-eslint)
[![npm deps](https://david-dm.org/beemojs/dev.svg?path=packages/config-eslint)](https://www.npmjs.com/package/@beemo/config-eslint)

An official Beemo ESLint config based on
[eslint-config-beemo](https://www.npmjs.com/package/eslint-config-beemo).

```bash
yarn install --dev eslint @beemo/core @beemo/driver-eslint @beemo/config-eslint
```

## Setup

Create a `configs/eslint.ts` file in your Beemo configuration module that re-exports this config.

```ts
export { default } from '@beemo/config-eslint';
```

## Settings

The following Beemo `settings` can be defined and will be passed to the config.

- `node` (`boolean`) - Denote as a Node.js project. Defaults to `false`.
- `react` (`boolean | classic | automatic`) - Enable React rules. Defaults to `false`.

```ts
export default {
	module: '<config-module>',
	drivers: ['eslint'],
	settings: {
		react: 'automatic',
	},
};
```
