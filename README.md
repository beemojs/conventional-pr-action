# conventional-pr-action

GitHub Action that validates the PR title against a
[Conventional Commits](https://www.conventionalcommits.org) preset.

## Setup

Install your changelog preset as a dev dependency in your application. For example:

```
yarn add --dev conventional-changelog-beemo
```

Create a `.github/workflows/pr.yml` file in your repository, with the following contents (the
`GITHUB_TOKEN` environment variable is required).

```yaml
name: PR
on: pull_request
jobs:
  conventional:
    name: Conventional PR
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v1
      - uses: beemojs/conventional-pr-action@v1
        with:
          config-preset: 'beemo'
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

Supports the following input options:

- `config-preset` - The conventional changelog config preset. Defaults to
  [`beemo`](https://github.com/beemojs/conventional-changelog-beemo).
- `require-multiple-commits` - Validates the commits for use within squash merging. Defaults to
  `true`.
