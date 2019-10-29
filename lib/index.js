"use strict";
/* eslint-disable complexity, @typescript-eslint/camelcase */
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const github = __importStar(require("@actions/github"));
const core_1 = require("@actions/core");
const conventional_changelog_preset_loader_1 = __importDefault(require("conventional-changelog-preset-loader"));
const conventional_commits_parser_1 = __importDefault(require("conventional-commits-parser"));
async function run() {
    try {
        // Verify context
        const { GITHUB_TOKEN } = process.env;
        const { issue } = github.context;
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
        let config;
        try {
            config = conventional_changelog_preset_loader_1.default(core_1.getInput('config-preset'));
        }
        catch (_a) {
            let preset = core_1.getInput('config-preset');
            if (!preset.startsWith('conventional-changelog-')) {
                preset = `conventional-changelog-${preset}`;
            }
            throw new Error(`Preset "${preset}" does not exist.`);
        }
        // Verify the PR title against the preset
        let result = null;
        if (typeof config.checkCommitFormat === 'function') {
            result = config.checkCommitFormat(pr.title);
        }
        else {
            result = conventional_commits_parser_1.default.sync(pr.title, config.parserOpts);
        }
        if (!result || !result.type) {
            throw new Error("PR title doesn't follow conventional changelog format.");
        }
        // Verify commit integrity
        if (core_1.getInput('require-multiple-commits') && pr.commits < 2) {
            const { data: commits } = await octokit.pulls.listCommits({
                ...github.context.repo,
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
        core_1.setFailed(error.message);
    }
}
run();
