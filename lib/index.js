"use strict";
/* eslint-disable complexity */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const github_1 = require("@actions/github");
const core_1 = require("@actions/core");
const exec_1 = require("@actions/exec");
const conventional_changelog_preset_loader_1 = __importDefault(require("conventional-changelog-preset-loader"));
const conventional_commits_parser_1 = __importDefault(require("conventional-commits-parser"));
const CWD = process.env.GITHUB_WORKSPACE;
// The action has a separate node modules than the repository,
// so we need to require from the repository's node modules
// using CWD, otherwise the module is not found.
function requireModule(name) {
    // eslint-disable-next-line
    return require(require.resolve(name, {
        paths: [path_1.default.join(CWD, 'node_modules')],
    }));
}
async function installPresetPackage(name, version) {
    const pkg = `${name}@${version}`;
    core_1.startGroup(`Installing ${pkg} preset package`);
    if (fs_1.default.existsSync(path_1.default.join(CWD, 'yarn.lock'))) {
        await exec_1.exec('yarn', ['add', pkg], { cwd: CWD });
    }
    else {
        await exec_1.exec('npm', ['install', pkg], { cwd: CWD });
    }
    core_1.endGroup();
}
async function run() {
    try {
        core_1.info('Loading GitHub context and pull request');
        // Verify context
        const { GITHUB_TOKEN } = process.env;
        const { issue } = github_1.context;
        if (!GITHUB_TOKEN) {
            throw new Error('A `GITHUB_TOKEN` environment variable is required.');
        }
        if (!issue || !issue.number) {
            throw new Error('Action may only be ran in the context of a pull request.');
        }
        // Load PR
        const octokit = github_1.getOctokit(GITHUB_TOKEN);
        const { data: pr } = await octokit.pulls.get({
            ...github_1.context.repo,
            pull_number: issue.number,
        });
        // Install preset
        const version = core_1.getInput('config-version') || 'latest';
        const preset = core_1.getInput('config-preset') || 'beemo';
        const presetModule = preset.startsWith('conventional-changelog-')
            ? preset
            : `conventional-changelog-${preset}`;
        if (core_1.getInput('auto-install')) {
            await installPresetPackage(presetModule, version);
        }
        // Load preset
        core_1.info('Loading preset package');
        const loadPreset = conventional_changelog_preset_loader_1.default.presetLoader(requireModule);
        let config;
        try {
            config = loadPreset(preset);
        }
        catch (_a) {
            throw new Error(`Preset "${presetModule}" does not exist.`);
        }
        // Verify the PR title against the preset
        core_1.info('Validating pull request against preset');
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
            core_1.info('Checking for multiple commits');
            const { data: commits } = await octokit.pulls.listCommits({
                ...github_1.context.repo,
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
// eslint-disable-next-line @typescript-eslint/no-floating-promises
run();
