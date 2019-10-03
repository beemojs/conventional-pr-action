/* eslint-disable @typescript-eslint/camelcase */

import * as core from '@actions/core';
import * as github from '@actions/github';
import loadPreset from 'conventional-changelog-preset-loader';
import parseCommit from 'conventional-commits-parser';

async function run() {
  try {
    // Verify context
    const { GITHUB_TOKEN } = process.env;
    const { issue } = github.context;

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

    // Verify the PR title against the preset
    const config = loadPreset(core.getInput('config-preset'));
    let result = null;

    if (typeof config.checkCommitFormat === 'function') {
      result = config.checkCommitFormat(pr.title);
    } else {
      result = parseCommit.sync(pr.title, config.parserOpts);
    }

    if (!result || !result.type) {
      throw new Error('PR title requires a conventional changelog prefix.');
    }

    // Verify commit integrity
    if (core.getInput('require-multiple-commits') && pr.commits < 2) {
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
    core.setFailed(error.message);
  }
}

run();
