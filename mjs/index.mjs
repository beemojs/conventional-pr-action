function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
import fs from 'node:fs';
import path from 'node:path';
import { createPresetLoader } from 'conventional-changelog-preset-loader';
import { CommitParser } from 'conventional-commits-parser';
import { startGroup, endGroup, info, getInput, getBooleanInput, setFailed } from '@actions/core';
import { exec } from '@actions/exec';
import { context, getOctokit } from '@actions/github';
import resolve from 'enhanced-resolve';

/* eslint-disable complexity */

const CWD = process.env.GITHUB_WORKSPACE;
function getPath(part) {
  return path.join(CWD, part);
}

// The action has a separate node modules than the repository,
// so we need to require from the repository's node modules
// using CWD, otherwise the module is not found.
async function requireModule(name) {
  return import(resolve.sync(getPath('node_modules'), name));
}
let pm;
function detectPackageManager() {
  if (pm) {
    return pm;
  }
  if (fs.existsSync(getPath('bun.lockb'))) {
    pm = 'bun';
  } else if (fs.existsSync(getPath('yarn.lock'))) {
    pm = 'yarn';
  } else if (fs.existsSync(getPath('pnpm-lock.yaml'))) {
    pm = 'pnpm';
  } else {
    pm = 'npm';
  }
  return pm;
}
function isYarn2AndAbove() {
  return fs.existsSync(getPath('.yarn')) || fs.existsSync(getPath('.yarnrc.yml'));
}
function getPackageJson() {
  return JSON.parse(fs.readFileSync(getPath('package.json'), 'utf8'));
}

// This action may be configured in a non-JS project,
// but we still want to support it. So create a fake package.json.
function createPackageJson() {
  const pkgPath = getPath('package.json');
  if (!fs.existsSync(pkgPath)) {
    fs.writeFileSync(pkgPath, JSON.stringify({
      description: '',
      name: 'conventional-pr-action-temporary-package',
      version: '0.0.0'
    }), 'utf8');
  }
}
async function installPackages() {
  const bin = detectPackageManager();
  startGroup(`Installing dependencies with ${bin}`);
  createPackageJson();
  await exec(bin, ['install'], {
    cwd: CWD
  });
  endGroup();
}
async function installPresetPackage(name, version) {
  const bin = detectPackageManager();
  const pkg = `${name}@${version}`;
  const args = [bin === 'npm' ? 'install' : 'add', pkg];
  startGroup(`Installing preset package ${pkg}`);

  // Yarn
  if (bin === 'yarn') {
    if ('workspaces' in getPackageJson() && !isYarn2AndAbove()) {
      info('Workspaces detected, installing to root');
      args.push('-W');
    }
    await exec('yarn', args, {
      cwd: CWD
    });

    // pnpm
  } else if (bin === 'pnpm') {
    if (fs.existsSync(getPath('pnpm-workspace.yaml'))) {
      info('Workspaces detected, installing to root');
      args.push('-W');
    }
    await exec('pnpm', args, {
      cwd: CWD
    });

    // npm
  } else if (bin === 'bun') {
    await exec('bun', args, {
      cwd: CWD
    });

    // npm
  } else {
    await exec('npm', args, {
      cwd: CWD
    });
  }
  endGroup();
}
function isInputEnabled(name) {
  const value = getInput(name);

  // getBooleanInput throws an error for undefined/empty values
  if (!value) {
    return false;
  }
  return getBooleanInput(name);
}
async function run() {
  try {
    info('Loading GitHub context and pull request');

    // Verify context
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const issue = context.issue;
    if (!GITHUB_TOKEN) {
      throw new Error('A `GITHUB_TOKEN` environment variable is required.');
    }
    if (!issue || !issue.number) {
      throw new Error('Action may only be ran in the context of a pull request.');
    }

    // Load PR
    const octokit = getOctokit(GITHUB_TOKEN);
    const _await$octokit$rest$p = await octokit.rest.pulls.get(_objectSpread(_objectSpread({}, context.repo), {}, {
        pull_number: issue.number
      })),
      pr = _await$octokit$rest$p.data;

    // Install dependencies
    const autoInstall = isInputEnabled('auto-install');
    if (autoInstall) {
      await installPackages();
    }

    // Install preset
    const version = getInput('config-version') || 'latest';
    const preset = getInput('config-preset') || 'beemo';
    const presetModule = preset.startsWith('conventional-changelog-') ? preset : `conventional-changelog-${preset}`;
    if (autoInstall) {
      await installPresetPackage(presetModule, version);
    }

    // Load preset
    info(`Loading preset package ${presetModule}`);
    const loadPreset = createPresetLoader(requireModule);
    let config;
    try {
      config = await loadPreset(preset);
    } catch (error) {
      console.error(error);
      throw new Error(`Preset "${presetModule}" does not exist.`);
    }

    // Verify the PR title against the preset
    info('Validating pull request against preset');
    const parser = new CommitParser(config.parserOpts);
    const result = parser.parse(pr.title);
    if (!result || !result.type) {
      throw new Error("PR title doesn't follow conventional changelog format.");
    }

    // Verify commit integrity
    if (isInputEnabled('require-multiple-commits') && pr.commits < 2) {
      info('Checking for multiple commits');
      const _await$octokit$rest$p2 = await octokit.rest.pulls.listCommits(_objectSpread(_objectSpread({}, context.repo), {}, {
          pull_number: issue.number
        })),
        commits = _await$octokit$rest$p2.data;
      if (commits[0].commit.message === pr.title) {
        // When a single commit exists, and it matches the PR title,
        // then we can safely assume the correct conventional log will be used.
      } else {
        throw new Error('PR must contain multiple commits for conventional title to be used.');
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      setFailed(error.message);
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
run();
//# sourceMappingURL=index.mjs.map
