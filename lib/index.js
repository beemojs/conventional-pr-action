'use strict';

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var fs = require('fs');

var path = require('path');

var loader = require('conventional-changelog-preset-loader');

var parseCommit = require('conventional-commits-parser');

var core = require('@actions/core');

var exec = require('@actions/exec');

var github = require('@actions/github');

function _interopDefault(e) {
  return e && e.__esModule ? e : {
    default: e
  };
}

var fs__default = /*#__PURE__*/_interopDefault(fs);

var path__default = /*#__PURE__*/_interopDefault(path);

var loader__default = /*#__PURE__*/_interopDefault(loader);

var parseCommit__default = /*#__PURE__*/_interopDefault(parseCommit);
/* eslint-disable complexity */


const CWD = process.env.GITHUB_WORKSPACE;

function getPath(part) {
  return path__default.default.join(CWD, part);
} // The action has a separate node modules than the repository,
// so we need to require from the repository's node modules
// using CWD, otherwise the module is not found.


function requireModule(name) {
  return require(require.resolve(name, {
    paths: [getPath('node_modules')]
  }));
}

let pm;

function detectPackageManager() {
  if (pm) {
    return pm;
  }

  if (fs__default.default.existsSync(getPath('yarn.lock'))) {
    pm = 'yarn';
  } else if (fs__default.default.existsSync(getPath('pnpm-lock.yaml'))) {
    pm = 'pnpm';
  } else {
    pm = 'npm';
  }

  return pm;
}

function isYarn2AndAbove() {
  return fs__default.default.existsSync(getPath('.yarn')) || fs__default.default.existsSync(getPath('.yarnrc.yml'));
}

function getPackageJson() {
  return JSON.parse(fs__default.default.readFileSync(getPath('package.json'), 'utf8'));
} // This action may be configured in a non-JS project,
// but we still want to support it. So create a fake package.json.


function createPackageJson() {
  const pkgPath = getPath('package.json');

  if (!fs__default.default.existsSync(pkgPath)) {
    fs__default.default.writeFileSync(pkgPath, JSON.stringify({
      description: '',
      name: 'conventional-pr-action-temporary-package',
      version: '0.0.0'
    }), 'utf8');
  }
}

async function installPackages() {
  const bin = detectPackageManager();
  core.startGroup(`Installing dependencies with ${bin}`);
  createPackageJson();
  await (bin === 'yarn' || bin === 'pnpm' ? exec.exec(bin, ['install', isYarn2AndAbove() ? '--immutable' : '--frozen-lockfile'], {
    cwd: CWD
  }) : exec.exec('npm', ['install'], {
    cwd: CWD
  }));
  core.endGroup();
}

async function installPresetPackage(name, version) {
  const bin = detectPackageManager();
  const pkg = `${name}@${version}`;
  const args = [bin === 'npm' ? 'install' : 'add', pkg];
  core.startGroup(`Installing preset package ${pkg}`); // Yarn

  if (bin === 'yarn') {
    if ('workspaces' in getPackageJson() && !isYarn2AndAbove()) {
      core.info('Workspaces detected, installing to root');
      args.push('-W');
    }

    await exec.exec('yarn', args, {
      cwd: CWD
    }); // pnpm
  } else if (bin === 'pnpm') {
    if (fs__default.default.existsSync(getPath('pnpm-workspace.yaml'))) {
      core.info('Workspaces detected, installing to root');
      args.push('-W');
    }

    await exec.exec('pnpm', args, {
      cwd: CWD
    }); // npm
  } else {
    await exec.exec('npm', args, {
      cwd: CWD
    });
  }

  core.endGroup();
}

function isInputEnabled(name) {
  const value = core.getInput(name); // getBooleanInput throws an error for undefined/empty values

  if (!value) {
    return false;
  }

  return core.getBooleanInput(name);
}

async function run() {
  try {
    core.info('Loading GitHub context and pull request'); // Verify context

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const issue = github.context.issue;

    if (!GITHUB_TOKEN) {
      throw new Error('A `GITHUB_TOKEN` environment variable is required.');
    }

    if (!issue || !issue.number) {
      throw new Error('Action may only be ran in the context of a pull request.');
    } // Load PR


    const octokit = github.getOctokit(GITHUB_TOKEN);

    const _await$octokit$rest$p = await octokit.rest.pulls.get(_objectSpread(_objectSpread({}, github.context.repo), {}, {
      pull_number: issue.number
    })),
          pr = _await$octokit$rest$p.data; // Install dependencies


    const autoInstall = isInputEnabled('auto-install');

    if (autoInstall) {
      await installPackages();
    } // Install preset


    const version = core.getInput('config-version') || 'latest';
    const preset = core.getInput('config-preset') || 'beemo';
    const presetModule = preset.startsWith('conventional-changelog-') ? preset : `conventional-changelog-${preset}`;

    if (autoInstall) {
      await installPresetPackage(presetModule, version);
    } // Load preset


    core.info('Loading preset package');
    const loadPreset = loader__default.default.presetLoader(requireModule);
    let config;

    try {
      config = loadPreset(preset);
    } catch {
      throw new Error(`Preset "${presetModule}" does not exist.`);
    } // Verify the PR title against the preset


    core.info('Validating pull request against preset');
    let result = null;
    result = typeof config.checkCommitFormat === 'function' ? config.checkCommitFormat(pr.title) : parseCommit__default.default.sync(pr.title, config.parserOpts);

    if (!result || !result.type) {
      throw new Error("PR title doesn't follow conventional changelog format.");
    } // Verify commit integrity


    if (isInputEnabled('require-multiple-commits') && pr.commits < 2) {
      core.info('Checking for multiple commits');

      const _await$octokit$rest$p2 = await octokit.rest.pulls.listCommits(_objectSpread(_objectSpread({}, github.context.repo), {}, {
        pull_number: issue.number
      })),
            commits = _await$octokit$rest$p2.data;

      if (commits[0].commit.message === pr.title) {// When a single commit exists, and it matches the PR title,
        // then we can safely assume the correct conventional log will be used.
      } else {
        throw new Error('PR must contain multiple commits for conventional title to be used.');
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(error.message);
    }
  }
} // eslint-disable-next-line @typescript-eslint/no-floating-promises


run();
//# sourceMappingURL=index.js.map
