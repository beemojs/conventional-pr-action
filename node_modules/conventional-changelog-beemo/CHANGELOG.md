## 1.6.0 - 2021-02-05

#### 🚀 Updates

- Added a new commit prefix type, `perf`, which can be used for performance improvements. This is a
  patch version bump.

#### 📦 Dependencies

- Updated all to latest.

### 1.5.3 - 2019-11-12

#### 🐞 Fixes

- Actually support deep links (monorepos, etc) correctly.

### 1.5.2 - 2019-11-11

#### 🐞 Fixes

- Will not autolink `@username` tokens that are wrapped in backticks.
- Will properly link commits and issues within monorepos, or projects that define invalid
  `package.json` repository URLs.

#### 📦 Dependencies

- Updated all to latest.

### 1.5.1 - 2019-10-02

#### 📦 Dependencies

- Updated all to latest.

## 1.5.0 - 2019-07-27

#### 🚀 Updates

- Added a new commit prefix type, `types`, which can be used when updating a type system (TypeScript
  or Flow). This is a patch version bump.

## 1.4.0 - 2019-07-07

#### 🚀 Updates

- Added `breaking` as another type alias for breaking changes.

## 1.3.0 - 2019-05-09

#### 🚀 Updates

- Added `getTypeGroup` function, which will return group information (emoji, label, etc) based on
  commit type.
- Added a new commit prefix type, `patch`, which is an alias for `fix`.

#### 🛠 Internals

- **[TS]** Fixed some index import issues.

### 1.2.1 - 2019-04-24

#### 🐞 Fixes

- Fixed a minor version bump issue when no patch commits exist.

## 1.2.0 - 2019-04-10

#### 🚀 Updates

- Added a new commit prefix type, `deps`, which can be used when bumping dependencies. This is a
  patch version bump.
- Added space support to commit scopes.

### 1.1.1 - 2019-04-08

#### 🐞 Fixes

- Allow uppercase characters in commit message scope.

## 1.1.0 - 2019-04-04

#### 🚀 Updates

- Added a `checkCommitFormat` named export, which can be used to check a message is valid. Perfect
  for CI checks.

# 1.0.0 - 2019-04-02

#### 🎉 Release

- Initial release!
