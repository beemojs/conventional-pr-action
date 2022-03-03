// This is ugly, but we can't use `export =` and named exports
// within TypeScript, so we need to fake it here so our types
// resolve correctly in consumers.

const imports = require('./lib');

Object.assign(imports.config, imports);

module.exports = imports.config;
