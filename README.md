# conventional-pr-action

GitHub Action that validates a pull request title against a
[Conventional Commits](https://www.conventionalcommits.org) preset.

## Setup

Create a `.github/workflows/pr.yml` file in your repository with the following contents. The
`GITHUB_TOKEN` environment variable and v2 actions _are_ required.

```yaml
name: PR
on: pull_request
jobs:
  conventional:
    name: Conventional PR
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - uses: beemojs/conventional-pr-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Supports the following input options:

- `auto-install` - Automatically install dependencies and the preset npm package. Defaults to
  `true`.
- `config-preset` - The conventional changelog config preset. Defaults to
  [`beemo`](https://github.com/beemojs/conventional-changelog-beemo).
- `config-version` - The conventional changelog config preset package version to install. Defaults
  to `latest`.
- `require-multiple-commits` - Validates the commits for use within squash merging. Defaults to
  `false`.

## Choosing a preset

Conventional commits require a changelog preset, and this action defaults to [`conventional-changelog-beemo`](https://github.com/beemojs/conventional-changelog-beemo). If you'd like to use another preset, update the `config-preset` option.

```yaml
- uses: beemojs/conventional-pr-action@v2
  with:
    config-preset: eslint
```

Furthermore, the preset _must_ exist in `node_modules` for the action to work correctly. The action currently supports the following workflows:

### Automatic installation

If the `auto-install` option is true (the default), the action will automatically install the preset at the root of the repository using your chosen package manager.

> This will modify the working tree of your checkout!

### Manual installation

If you don't want to use automatic installation, you'll need to disable the `auto-install` option, and add your chosen preset manually to `devDependencies` in the root `package.json`.

```yaml
- uses: beemojs/conventional-pr-action@v2
  with:
    auto-install: false
```
