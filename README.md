# Angular Directive Workspace

An Angular 21 library workspace containing a standalone directive library and a signal utility library. Both are built with `ng-packagr` for npm publishing.

## Projects

### [`ng-tailwind-merge`](./projects/ng-tailwind-merge)
An Angular standalone directive that merges Tailwind CSS classes using `tailwind-merge` and `clsx`.

**Features:**
- `[twMerge]` directive - merges `class` and `ngClass` attributes
- `[merge]` directive - dynamic class merging via property binding  
- `cn()` and `mergeTailwindClasses()` utility functions
- Signal-based inputs
- Tree-shakeable

See [ng-tailwind-merge README](./projects/ng-tailwind-merge/README.md) for detailed usage.

### [`@sergeydus/ng-signals-utils`](./projects/ng-signals-utils)
Utility functions for working with Angular signals.

**Features:**
- Signal transformations - `mapSignal`, `filterSignal`, `debounceSignal`, `combineSignals`, `distinctSignal`
- Array utilities - `arraySignalPush`, `arraySignalFilter`, `arraySignalMap`, `arraySignalSort`, and more
- Object utilities - `patchSignal`, `pickSignal`, `omitSignal`, `pluckSignal`, and more
- Effect helpers - `watchSignal`, `watchUntil`, `throttleEffect`, `debounceEffect`
- Type-safe with full TypeScript support
- Tree-shakeable

See [@sergeydus/ng-signals-utils README](./projects/ng-signals-utils/README.md) for detailed usage.

## Setup

### Prerequisites
- Node.js `^22.22.3 || ^24.15.0` to run the workspace's Angular 21 toolchain and both Angular 21 and 22 consumer checks. See [Angular's compatibility table](https://angular.dev/reference/versions).
- npm 11 (the workspace declares `npm@11.2.0`)

### Installation

```bash
npm ci
```

## Development

### Build All Libraries

```bash
npm run build
```

### Build Specific Library

```bash
npm run ng -- build ng-tailwind-merge
npm run ng -- build ng-signals-utils
```

### Run Tests

```bash
npm test
```

To run only one library's tests once:

```bash
npm run ng -- test ng-tailwind-merge --watch=false
npm run ng -- test ng-signals-utils --watch=false
```

### Watch a Library Build

```bash
npm run watch:ng-tailwind-merge
npm run watch:ng-signals-utils
```

### Verify packed packages in a clean consumer

```bash
npm run verify:consumer:21
npm run verify:consumer:22
```

This builds both libraries, checks the tarball contents and Angular core peer ranges,
installs the tarballs in a generated Angular 21 or 22 app under the ignored
`tmp/` directory, and runs a strict production build for each version. The
build compiles every TypeScript example in the two package READMEs and the
signals package's `EXAMPLES.md` from their Markdown source.
The generated app is removed on success and retained for inspection on failure.
The library runtime tests in `npm test` still use the workspace's Angular 21
toolchain.

### Generate API reference

```bash
npm run docs:ng-signals-utils
```

This regenerates `docs/ng-signals-utils/` from the signals library source.
The generated HTML is ignored by Git and excluded from npm packages; the
package includes its README and `EXAMPLES.md` instead.

## Publishing to npm

Build and inspect the package you intend to release:

```bash
npm run ng -- build ng-tailwind-merge
cd dist/ng-tailwind-merge
npm pack --dry-run
```

For the signals library, use `npm run ng -- build ng-signals-utils` and inspect `dist/ng-signals-utils` instead. Review each package's changelog and version before publishing from the relevant `dist/<library>` directory.

Each library is configured with `ng-packagr` for automated bundling and distribution.
Use the [manual release checklist](./RELEASE_CHECKLIST.md) before publishing.
