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
