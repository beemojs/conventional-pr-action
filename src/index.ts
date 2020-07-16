/* eslint-disable complexity */

import fs from 'fs';
import path from 'path';
import { context, getOctokit } from '@actions/github';
import { getInput, setFailed, info, startGroup, endGroup } from '@actions/core';
import { exec } from '@actions/exec';
import loader from 'conventional-changelog-preset-loader';
import parseCommit from 'conventional-commits-parser';

const CWD = process.env.GITHUB_WORKSPACE!;

// The action has a separate node modules than the repository,
// so we need to require from the repository's node modules
// using CWD, otherwise the module is not found.
function requireModule(name: string) {
  // eslint-disable-next-line
  return require(require.resolve(name, {
    paths: [path.join(CWD, 'node_modules')],
  }));
}

let pm: 'yarn' | 'pnpm' | 'npm';

function detectPackageManager() {
  if (pm) {
    return pm;
  }

  if (fs.existsSync(path.join(CWD, 'yarn.lock'))) {
    pm = 'yarn';
  } else if (fs.existsSync(path.join(CWD, 'pnpm-lock.yaml'))) {
    pm = 'pnpm';
  } else {
    pm = 'npm';
  }

  return pm;
}

async function installPackages() {
  const bin = detectPackageManager();

  startGroup(`Installing dependencies with ${bin}`);

  if (bin === 'yarn' || bin === 'pnpm') {
    await exec(bin, ['install', '--frozen-lockfile'], { cwd: CWD });
  } else {
    await exec('npm', ['ci'], { cwd: CWD });
  }

  endGroup();
}

async function installPresetPackage(name: string, version: string) {
  const bin = detectPackageManager();
  const pkg = `${name}@${version}`;

  startGroup(`Installing preset package ${pkg}`);

  if (bin === 'yarn' || bin === 'pnpm') {
    await exec(bin, ['add', pkg], { cwd: CWD });
  } else {
    await exec('npm', ['install', pkg], { cwd: CWD });
  }

  endGroup();
}

async function run() {
  try {
    info('Loading GitHub context and pull request');

    // Verify context
    const { GITHUB_TOKEN } = process.env;
    const { issue } = context;

    if (!GITHUB_TOKEN) {
      throw new Error('A `GITHUB_TOKEN` environment variable is required.');
    }

    if (!issue || !issue.number) {
      throw new Error('Action may only be ran in the context of a pull request.');
    }

    // Load PR
    const octokit = getOctokit(GITHUB_TOKEN);
    const { data: pr } = await octokit.pulls.get({
      ...context.repo,
      pull_number: issue.number,
    });

    // Install dependencies
    const autoInstall = getInput('auto-install');

    if (autoInstall) {
      await installPackages();
    }

    // Install preset
    const version = getInput('config-version') || 'latest';
    const preset = getInput('config-preset') || 'beemo';
    const presetModule = preset.startsWith('conventional-changelog-')
      ? preset
      : `conventional-changelog-${preset}`;

    if (autoInstall) {
      await installPresetPackage(presetModule, version);
    }

    // Load preset
    info('Loading preset package');

    const loadPreset = loader.presetLoader(requireModule);
    let config: ReturnType<typeof loadPreset>;

    try {
      config = loadPreset(preset);
    } catch {
      throw new Error(`Preset "${presetModule}" does not exist.`);
    }

    // Verify the PR title against the preset
    info('Validating pull request against preset');

    let result = null;

    if (typeof config.checkCommitFormat === 'function') {
      result = config.checkCommitFormat(pr.title);
    } else {
      result = parseCommit.sync(pr.title, config.parserOpts);
    }

    if (!result || !result.type) {
      throw new Error("PR title doesn't follow conventional changelog format.");
    }

    // Verify commit integrity
    if (getInput('require-multiple-commits') && pr.commits < 2) {
      info('Checking for multiple commits');

      const { data: commits } = await octokit.pulls.listCommits({
        ...context.repo,
        pull_number: issue.number,
      });

      if (commits[0].commit.message === pr.title) {
        // When a single commit exists, and it matches the PR title,
        // then we can safely assume the correct conventional log will be used.
      } else {
        throw new Error('PR must contain multiple commits for conventional title to be used.');
      }
    }
  } catch (error) {
    setFailed(error.message);
  }
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
run();
