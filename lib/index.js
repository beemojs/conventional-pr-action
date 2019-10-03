"use strict";
/* eslint-disable @typescript-eslint/camelcase */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = __importDefault(require("@actions/core"));
const github_1 = __importDefault(require("@actions/github"));
const conventional_changelog_preset_loader_1 = __importDefault(require("conventional-changelog-preset-loader"));
const conventional_commits_parser_1 = __importDefault(require("conventional-commits-parser"));
async function run() {
    try {
        // Verify context
        const { GITHUB_TOKEN } = process.env;
        const { issue } = github_1.default.context;
        if (!GITHUB_TOKEN) {
            throw new Error('A `GITHUB_TOKEN` environment variable is required.');
        }
        if (!issue || !issue.number) {
            throw new Error('Action may only be ran in the context of a pull request.');
        }
        // Load PR
        const octokit = new github_1.default.GitHub(GITHUB_TOKEN);
        const { data: pr } = await octokit.pulls.get({
            ...github_1.default.context.repo,
            pull_number: issue.number,
        });
        // Verify the PR title against the preset
        const config = conventional_changelog_preset_loader_1.default(core_1.default.getInput('config-preset'));
        let result = null;
        if (typeof config.checkCommitFormat === 'function') {
            result = config.checkCommitFormat(pr.title);
        }
        else {
            result = conventional_commits_parser_1.default.sync(pr.title, config.parserOpts);
        }
        if (!result || !result.type) {
            throw new Error('PR title requires a conventional changelog prefix.');
        }
        // Verify commit integrity
        if (core_1.default.getInput('require-multiple-commits') && pr.commits < 2) {
            const { data: commits } = await octokit.pulls.listCommits({
                ...github_1.default.context.repo,
                pull_number: issue.number,
            });
            if (commits[0].commit.message === pr.title) {
                // When a single commit exists, and it matches the PR title,
                // then we can safely assume the correct conventional log will be used.
            }
            else {
                throw new Error('PR must contain multiple commits for conventional title to be used.');
            }
        }
    }
    catch (error) {
        core_1.default.setFailed(error.message);
    }
}
run();
