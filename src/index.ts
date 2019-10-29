/* eslint-disable complexity, @typescript-eslint/camelcase */

import fs from 'fs';
import path from 'path';
import * as github from '@actions/github';
import { getInput, setFailed } from '@actions/core';
import loader from 'conventional-changelog-preset-loader';
import parseCommit from 'conventional-commits-parser';

// The action has a separate node modules than the repository,
// so we need to require from the repository's node modules
// using CWD, otherwise the module is not found.
function requireModule(name: string) {
  // eslint-disable-next-line
  return require(require.resolve(name, {
    paths: [path.join(process.cwd(), 'node_modules')],
  }));
}

async function run() {
  try {
    // Verify context
    const { GITHUB_TOKEN } = process.env;
    const { issue } = github.context;

    console.log(fs.readdirSync(process.cwd()));
    console.log(process.cwd());

    if (!GITHUB_TOKEN) {
      throw new Error('A `GITHUB_TOKEN` environment variable is required.');
    }

    if (!issue || !issue.number) {
      throw new Error('Action may only be ran in the context of a pull request.');
    }

    // Load PR
    const octokit = new github.GitHub(GITHUB_TOKEN);
    const { data: pr } = await octokit.pulls.get({
      ...github.context.repo,
      pull_number: issue.number,
    });

    // Install preset
    const loadPreset = loader.presetLoader(requireModule);
    let config: ReturnType<typeof loadPreset>;

    try {
      config = loadPreset(getInput('config-preset'));
    } catch {
      let preset = getInput('config-preset');

      if (!preset.startsWith('conventional-changelog-')) {
        preset = `conventional-changelog-${preset}`;
      }

      throw new Error(`Preset "${preset}" does not exist.`);
    }

    // Verify the PR title against the preset
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
      const { data: commits } = await octokit.pulls.listCommits({
        ...github.context.repo,
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

run();
